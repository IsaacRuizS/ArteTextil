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
            .FirstOrDefaultAsync(u => u.UserId == userId && u.DeletedAt == null && u.IsActive);

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

        try
        {
            var validation = await ValidateVacationRequest(dto);
            if (!validation.Success)
            {
                return validation;
            }

            var startDate = dto.startDate.Date;
            var endDate = dto.endDate.Date;

            // Calcular días solicitados
            var daysRequested = (endDate - startDate).Days + 1;

            // Calcular disponibles
            var availableDays = await CalculateAvailableDays(dto.userId);

            // Calcular días ya usados
            var vacations = await _repository.Query()
    .Where(v => v.UserId == dto.userId
        && v.Status == "Aprobada"
        && v.DeletedAt == null)
    .ToListAsync();

            var usedDays = vacations.Sum(v => (v.EndDate.Date - v.StartDate.Date).Days + 1);

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
                StartDate = startDate,
                EndDate = endDate,
                Notes = dto.notes,
                Status = "Pendiente",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(entity);

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

    private async Task<ApiResponse<VacationRequestDto>> ValidateVacationRequest(VacationRequestDto dto)
    {
        var response = new ApiResponse<VacationRequestDto>();
        var today = DateTime.UtcNow.Date;

        if (dto == null)
        {
            response.Success = false;
            response.Message = "Debe enviar los datos de la solicitud.";
            return response;
        }

        if (dto.userId <= 0)
        {
            response.Success = false;
            response.Message = "Debe seleccionar un usuario válido.";
            return response;
        }

        var userExists = await _repository.Context.Users.AnyAsync(u =>
            u.UserId == dto.userId &&
            u.DeletedAt == null &&
            u.IsActive);

        if (!userExists)
        {
            response.Success = false;
            response.Message = "El usuario seleccionado no existe o está inactivo.";
            return response;
        }

        if (dto.startDate == default || dto.endDate == default)
        {
            response.Success = false;
            response.Message = "Debe indicar fecha de inicio y fecha fin.";
            return response;
        }

        if (dto.startDate.Date < today || dto.endDate.Date < today)
        {
            response.Success = false;
            response.Message = "Las vacaciones solo pueden solicitarse para fechas presentes o futuras.";
            return response;
        }

        if (dto.endDate.Date < dto.startDate.Date)
        {
            response.Success = false;
            response.Message = "La fecha final no puede ser menor que la fecha de inicio.";
            return response;
        }

        var overlaps = await _repository.Query().AnyAsync(v =>
            v.UserId == dto.userId &&
            v.DeletedAt == null &&
            (v.Status == "Pendiente" || v.Status == "Aprobada") &&
            dto.startDate.Date <= v.EndDate.Date &&
            dto.endDate.Date >= v.StartDate.Date);

        if (overlaps)
        {
            response.Success = false;
            response.Message = "Ya existe una solicitud de vacaciones para ese rango de fechas.";
            return response;
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

        var used = vacations.Sum(v => (v.EndDate.Date - v.StartDate.Date).Days + 1);

        return Math.Max(available - used, 0);
    }

    // Ver propias solicitudes
    public async Task<ApiResponse<List<VacationRequestDto>>> GetByUser(int userId)
    {
        var response = new ApiResponse<List<VacationRequestDto>>();

        try
        {
            var data = _repository.Query()
                .Where(v => v.UserId == userId && v.DeletedAt == null && v.EndDate.Date >= DateTime.UtcNow.Date)
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
                .Where(v => v.Status == "Pendiente" && v.DeletedAt == null && v.EndDate.Date >= DateTime.UtcNow.Date)
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

            if (req.StartDate.Date < DateTime.UtcNow.Date)
            {
                response.Success = false;
                response.Message = "No se puede aprobar una solicitud con fecha de inicio en el pasado.";
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
                .Where(v => v.DeletedAt == null && v.EndDate.Date >= DateTime.UtcNow.Date)
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
