using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using System.Text.Json;

namespace ArteTextil.Business;

public class PayrollAdjustmentBusiness
{
    private readonly IRepositoryPayrollAdjustment _repository;
    private readonly IMapper _mapper;
    private readonly ISystemLogHelper _logHelper;

    public PayrollAdjustmentBusiness(
        ArteTextilDbContext context,
        IMapper mapper,
        ISystemLogHelper logHelper)
    {
        _repository = new RepositoryPayrollAdjustment(context);
        _mapper = mapper;
        _logHelper = logHelper;
    }

    // Crear ajuste
    public async Task<ApiResponse<PayrollAdjustmentDto>> Create(PayrollAdjustmentDto dto)
    {
        var response = new ApiResponse<PayrollAdjustmentDto>();

        try
        {
            if (dto.amount == 0)
            {
                response.Success = false;
                response.Message = "El monto no puede ser 0";
                return response;
            }

            if (dto.type != "Extra" && dto.type != "Rebajo")
            {
                response.Success = false;
                response.Message = "Tipo inválido (Extra/Rebajo)";
                return response;
            }

            var entity = _mapper.Map<PayrollAdjustment>(dto);
            entity.IsActive = true;
            entity.CreatedAt = DateTime.UtcNow;

            await _repository.AddAsync(entity);

            await _logHelper.LogCreate(
                "PayrollAdjustments",
                entity.AdjustmentId,
                JsonSerializer.Serialize(entity)
            );

            response.Data = _mapper.Map<PayrollAdjustmentDto>(entity);
            response.Message = "Ajuste creado";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Ver por usuario
    public async Task<ApiResponse<List<PayrollAdjustmentDto>>> GetByUser(int userId)
    {
        var response = new ApiResponse<List<PayrollAdjustmentDto>>();

        try
        {
            var data = await _repository.GetAllAsync(a =>
                a.UserId == userId &&
                a.DeletedAt == null);

            response.Data = _mapper.Map<List<PayrollAdjustmentDto>>(data);
            response.Message = "Ajustes obtenidos";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Delete
    public async Task<ApiResponse<bool>> Delete(int id)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var adj = await _repository.FirstOrDefaultAsync(a =>
                a.AdjustmentId == id &&
                a.DeletedAt == null);

            if (adj == null)
            {
                response.Success = false;
                response.Message = "Ajuste no encontrado";
                return response;
            }

            var prev = JsonSerializer.Serialize(adj);

            adj.IsActive = false;
            adj.DeletedAt = DateTime.UtcNow;

            _repository.Update(adj);
            await _repository.SaveAsync();

            await _logHelper.LogDelete(
                "PayrollAdjustments",
                adj.AdjustmentId,
                prev
            );

            response.Data = true;
            response.Message = "Ajuste eliminado";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }
}