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

    private async Task<int> CalculateAvailableDays(int userId)
    {
        var user = await _repository.Context.Users
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null) return 0;

        var monthsWorked = (DateTime.UtcNow.Year - user.CreatedAt.Year) * 12
                         + DateTime.UtcNow.Month - user.CreatedAt.Month;

        if (monthsWorked < 0) monthsWorked = 0;

        return monthsWorked; // 1 día por mes
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

            // Calcular disponibles
            var availableDays = await CalculateAvailableDays(dto.userId);

            // Calcular días ya usados
            var vacations = await _repository.Query()
    .Where(v => v.UserId == dto.userId
        && v.Status == "Aprobada"
        && v.DeletedAt == null)
    .ToListAsync();

            var usedDays = vacations.Sum(v => (v.EndDate - v.StartDate).Days + 1);

            var remainingDays = availableDays - usedDays;

            if (daysRequested > remainingDays)
            {
                response.Success = false;
                response.Message = $"No tiene días suficientes. Disponibles: {remainingDays}";
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
        var available = await CalculateAvailableDays(userId);

        var vacations = await _repository.Query()
            .Where(v => v.UserId == userId
                && v.Status == "Aprobada"
                && v.DeletedAt == null)
            .ToListAsync();

        var used = vacations.Sum(v => (v.EndDate - v.StartDate).Days + 1);

        return available - used;
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