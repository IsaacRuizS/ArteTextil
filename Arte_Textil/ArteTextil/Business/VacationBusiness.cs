using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using System.Text.Json;

namespace ArteTextil.Business;

public class VacationBusiness
{
    private readonly IRepositoryVacation _repository;
    private readonly IMapper _mapper;
    private readonly ISystemLogHelper _logHelper;

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
            if (dto.endDate < dto.startDate)
            {
                response.Success = false;
                response.Message = "La fecha final no puede ser menor";
                return response;
            }

            var entity = _mapper.Map<Vacation>(dto);
            entity.Status = "Pendiente";
            entity.IsActive = true;
            entity.CreatedAt = DateTime.UtcNow;

            await _repository.AddAsync(entity);

            await _logHelper.LogCreate(
                "Vacations",
                entity.VacationId,
                JsonSerializer.Serialize(entity)
            );

            response.Data = _mapper.Map<VacationRequestDto>(entity);
            response.Message = "Solicitud enviada";
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
            var data = await _repository.GetAllAsync(v =>
                v.UserId == userId &&
                v.DeletedAt == null);

            response.Data = _mapper.Map<List<VacationRequestDto>>(data);
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
            var data = await _repository.GetAllAsync(v =>
                v.Status == "Pendiente" &&
                v.DeletedAt == null);

            response.Data = _mapper.Map<List<VacationRequestDto>>(data);
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
}