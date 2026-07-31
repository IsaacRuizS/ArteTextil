using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ArteTextil.Business;

public class VacationBusiness
{
    private readonly IRepositoryVacation _repository;
    private readonly IMapper _mapper;
    private readonly ISystemLogHelper _logHelper;

    // Días ganados: 1 por cada mes COMPLETO trabajado desde el ingreso.
    private async Task<int> CalculateAvailableDays(int userId)
    {
        var user = await _repository.Context.Users
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null) return 0;

        return CalculateEarnedDays(user.CreatedAt);
    }

    private static int CalculateEarnedDays(DateTime hireDate)
    {
        var today = DateTime.UtcNow.Date;
        var start = hireDate.Date;

        var monthsWorked = (today.Year - start.Year) * 12 + today.Month - start.Month;

        // Si aún no se cumple el día del mes, ese mes todavía no está completo.
        if (today.Day < start.Day) monthsWorked--;

        return monthsWorked < 0 ? 0 : monthsWorked; // 1 día por mes completo
    }

    // Días comprometidos: aprobados + pendientes de resolución.
    // Las solicitudes pendientes también reservan saldo, de lo contrario un
    // colaborador podría enviar varias solicitudes que sumadas exceden su saldo.
    private async Task<int> CalculateCommittedDays(int userId)
    {
        var vacations = await _repository.Query()
            .Where(v => v.UserId == userId
                && (v.Status == "Aprobada" || v.Status == "Pendiente")
                && v.DeletedAt == null)
            .ToListAsync();

        return vacations.Sum(v => (v.EndDate.Date - v.StartDate.Date).Days + 1);
    }

    public VacationBusiness(
        ArteTextilDbContext context,
        IMapper mapper,
        ISystemLogHelper logHelper)
    {
        _repository = new RepositoryVacation(context);
        _mapper = mapper;
        _logHelper = logHelper;
    }

    // Crear solicitud
    public async Task<ApiResponse<VacationRequestDto>> Create(VacationRequestDto dto)
    {
        var response = new ApiResponse<VacationRequestDto>();

        Console.WriteLine("DTO NOTES: " + dto.notes);

        try
        {
            if (dto.endDate < dto.startDate)
            {
                response.Success = false;
                response.Message = "La fecha final no puede ser menor";
                return response;
            }

            // Calcular días solicitados
            var daysRequested = (dto.endDate - dto.startDate).Days + 1;

            // Saldo = días ganados por antigüedad - días ya comprometidos
            var earnedDays = await CalculateAvailableDays(dto.userId);
            var committedDays = await CalculateCommittedDays(dto.userId);

            var remainingDays = Math.Max(earnedDays - committedDays, 0);

            if (daysRequested > remainingDays)
            {
                response.Success = false;
                response.Message = remainingDays == 0
                    ? "No tiene días de vacaciones disponibles. Se acumula 1 día por cada mes completo trabajado."
                    : $"Está solicitando {daysRequested} día(s) y solo tiene {remainingDays} disponible(s).";
                return response;
            }

            var entity = new Vacation
            {
                UserId = dto.userId,
                StartDate = dto.startDate,
                EndDate = dto.endDate,
                Notes = dto.notes,
                Status = "Pendiente",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            Console.WriteLine("ANTES DE GUARDAR VACATION");

            await _repository.AddAsync(entity);
            await _repository.SaveAsync();

            Console.WriteLine("DESPUES DE GUARDAR VACATION");
            Console.WriteLine($"USERID: {entity.UserId}");
            Console.WriteLine($"START: {entity.StartDate}");
            Console.WriteLine($"END: {entity.EndDate}");
            Console.WriteLine($"NOTES: {entity.Notes}");

            response.Data = _mapper.Map<VacationRequestDto>(entity);
            response.Message = "Solicitud enviada";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.InnerException?.Message ?? ex.Message;
        }

        return response;
    }

    // Calcular días disponibles
    public async Task<int> GetAvailableDays(int userId)
    {
        var earned = await CalculateAvailableDays(userId);
        var committed = await CalculateCommittedDays(userId);

        return Math.Max(earned - committed, 0);
    }

    // Desglose del saldo, para mostrarlo en pantalla sin adivinar el cálculo.
    public async Task<ApiResponse<VacationBalanceDto>> GetBalance(int userId)
    {
        var response = new ApiResponse<VacationBalanceDto>();

        try
        {
            var user = await _repository.Context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId && u.DeletedAt == null && u.IsActive);

            if (user == null)
            {
                response.Success = false;
                response.Message = "Usuario no encontrado o inactivo";
                return response;
            }

            var vacations = await _repository.Query()
                .Where(v => v.UserId == userId && v.DeletedAt == null)
                .ToListAsync();

            var days = (Vacation v) => (v.EndDate.Date - v.StartDate.Date).Days + 1;

            var earned = CalculateEarnedDays(user.CreatedAt);
            var approved = vacations.Where(v => v.Status == "Aprobada").Sum(days);
            var pending = vacations.Where(v => v.Status == "Pendiente").Sum(days);

            var today = DateTime.UtcNow.Date;
            var monthsWorked = (today.Year - user.CreatedAt.Year) * 12 + today.Month - user.CreatedAt.Month;
            if (today.Day < user.CreatedAt.Date.Day) monthsWorked--;

            response.Data = new VacationBalanceDto
            {
                userId = user.UserId,
                userName = user.FullName,
                hireDate = user.CreatedAt,
                monthsWorked = monthsWorked < 0 ? 0 : monthsWorked,
                earnedDays = earned,
                approvedDays = approved,
                pendingDays = pending,
                availableDays = Math.Max(earned - approved - pending, 0)
            };

            response.Message = "Saldo de vacaciones obtenido";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Saldo de todos los colaboradores activos (para el administrador).
    public async Task<ApiResponse<List<VacationBalanceDto>>> GetAllBalances()
    {
        var response = new ApiResponse<List<VacationBalanceDto>>();

        try
        {
            var users = await _repository.Context.Users
                .Where(u => u.DeletedAt == null && u.IsActive)
                .OrderBy(u => u.FullName)
                .ToListAsync();

            var vacations = await _repository.Query()
                .Where(v => v.DeletedAt == null
                    && (v.Status == "Aprobada" || v.Status == "Pendiente"))
                .ToListAsync();

            var days = (Vacation v) => (v.EndDate.Date - v.StartDate.Date).Days + 1;
            var today = DateTime.UtcNow.Date;

            response.Data = users.Select(u =>
            {
                var own = vacations.Where(v => v.UserId == u.UserId).ToList();

                var earned = CalculateEarnedDays(u.CreatedAt);
                var approved = own.Where(v => v.Status == "Aprobada").Sum(days);
                var pending = own.Where(v => v.Status == "Pendiente").Sum(days);

                var monthsWorked = (today.Year - u.CreatedAt.Year) * 12 + today.Month - u.CreatedAt.Month;
                if (today.Day < u.CreatedAt.Date.Day) monthsWorked--;

                return new VacationBalanceDto
                {
                    userId = u.UserId,
                    userName = u.FullName,
                    hireDate = u.CreatedAt,
                    monthsWorked = monthsWorked < 0 ? 0 : monthsWorked,
                    earnedDays = earned,
                    approvedDays = approved,
                    pendingDays = pending,
                    availableDays = Math.Max(earned - approved - pending, 0)
                };
            }).ToList();

            response.Message = "Saldos de vacaciones obtenidos";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Ver propias solicitudes
    public async Task<ApiResponse<List<VacationRequestDto>>> GetByUser(int userId)
    {
        var response = new ApiResponse<List<VacationRequestDto>>();

        try
        {
            var data = _repository.Query()
                .Where(v => v.UserId == userId && v.DeletedAt == null)
                .Join(
                    _repository.Context.Users,
                    v => v.UserId,
                    u => u.UserId,
                    (v, u) => new VacationRequestDto
                    {
                        vacationRequestId = v.VacationId,
                        userId = v.UserId,
                        userName = u.FullName,
                        startDate = v.StartDate,
                        endDate = v.EndDate,
                        status = v.Status,
                        notes = v.Notes,
                        ApprovedByUserId = v.ApprovedByUserId,
                        IsActive = v.IsActive,
                        createdAt = v.CreatedAt,
                        updatedAt = v.UpdatedAt,
                        deletedAt = v.DeletedAt
                    }
                ).ToList();

            response.Data = data;
            response.Message = "Solicitudes obtenidas";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Gerente: ver las pendientes
    public async Task<ApiResponse<List<VacationRequestDto>>> GetPending()
    {
        var response = new ApiResponse<List<VacationRequestDto>>();

        try
        {
            var data = _repository.Query()
                .Where(v => v.Status == "Pendiente" && v.DeletedAt == null)
                .Join(
                    _repository.Context.Users,
                    v => v.UserId,
                    u => u.UserId,
                    (v, u) => new VacationRequestDto
                    {
                        vacationRequestId = v.VacationId,
                        userId = v.UserId,
                        userName = u.FullName,  
                        startDate = v.StartDate,
                        endDate = v.EndDate,
                        status = v.Status,
                        notes = v.Notes,
                        ApprovedByUserId = v.ApprovedByUserId,
                        IsActive = v.IsActive,
                        createdAt = v.CreatedAt,
                        updatedAt = v.UpdatedAt,
                        deletedAt = v.DeletedAt
                    }
                ).ToList();

            response.Data = data;
            response.Message = "Solicitudes pendientes";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Aprobar
    public async Task<ApiResponse<bool>> Approve(int id, int approvedByUserId)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var req = await _repository.FirstOrDefaultAsync(v =>
                v.VacationId == id &&
                v.DeletedAt == null);

            if (req == null)
            {
                response.Success = false;
                response.Message = "Solicitud no encontrada";
                return response;
            }

            var prev = JsonSerializer.Serialize(req);

            req.Status = "Aprobada";
            req.ApprovedByUserId = approvedByUserId;
            req.UpdatedAt = DateTime.UtcNow;

            _repository.Update(req);
            await _repository.SaveAsync();

            await _logHelper.LogUpdate(
                "Vacations",
                req.VacationId,
                prev,
                JsonSerializer.Serialize(req)
            );

            response.Data = true;
            response.Message = "Solicitud aprobada";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Rechazar
    public async Task<ApiResponse<bool>> Reject(int id, int approvedByUserId)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var req = await _repository.FirstOrDefaultAsync(v =>
                v.VacationId == id &&
                v.DeletedAt == null);

            if (req == null)
            {
                response.Success = false;
                response.Message = "Solicitud no encontrada";
                return response;
            }

            var prev = JsonSerializer.Serialize(req);

            req.Status = "Rechazada";
            req.ApprovedByUserId = approvedByUserId;
            req.UpdatedAt = DateTime.UtcNow;

            _repository.Update(req);
            await _repository.SaveAsync();

            await _logHelper.LogUpdate(
                "Vacations",
                req.VacationId,
                prev,
                JsonSerializer.Serialize(req)
            );

            response.Data = true;
            response.Message = "Solicitud rechazada";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    public async Task<ApiResponse<List<VacationRequestDto>>> GetAll()
    {
        var response = new ApiResponse<List<VacationRequestDto>>();

        try
        {
            var data = _repository.Query()
                .Where(v => v.DeletedAt == null)
                .Join(
                    _repository.Context.Users,
                    v => v.UserId,
                    u => u.UserId,
                    (v, u) => new VacationRequestDto
                    {
                        vacationRequestId = v.VacationId,
                        userId = v.UserId,
                        userName = u.FullName,
                        startDate = v.StartDate,
                        endDate = v.EndDate,
                        status = v.Status,
                        notes = v.Notes,
                        ApprovedByUserId = v.ApprovedByUserId,
                        IsActive = v.IsActive,
                        createdAt = v.CreatedAt,
                        updatedAt = v.UpdatedAt,
                        deletedAt = v.DeletedAt
                    }
                ).ToList();

            response.Data = data;
            response.Message = "Solicitudes obtenidas";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }
}