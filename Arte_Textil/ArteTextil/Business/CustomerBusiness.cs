using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ArteTextil.Business;

public class CustomerBusiness
{
    private readonly IRepositoryCustomer _repositoryCustomer;
    private readonly IMapper _mapper;
    private readonly ISystemLogHelper _logHelper;

    public CustomerBusiness(
        ArteTextilDbContext context,
        IMapper mapper,
        ISystemLogHelper logHelper)
    {
        _repositoryCustomer = new RepositoryCustomer(context);
        _mapper = mapper;
        _logHelper = logHelper;
    }

        // GET ALL
        public async Task<ApiResponse<List<CustomerDto>>> GetAll()
    {
        var response = new ApiResponse<List<CustomerDto>>();

        try
        {
            var customers = await _repositoryCustomer.Query()
                .Where(c => c.DeletedAt == null)
                .ToListAsync();

            response.Data = _mapper.Map<List<CustomerDto>>(customers);
            response.Message = "Clientes obtenidos correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al obtener clientes: {ex.Message}";
        }

        return response;
    }

        // GET BY ID
        public async Task<ApiResponse<CustomerDto>> GetById(int id)
    {
        var response = new ApiResponse<CustomerDto>();

        try
        {
            var customer = await _repositoryCustomer
                .FirstOrDefaultAsync(c => c.CustomerId == id && c.DeletedAt == null);

            if (customer == null)
            {
                response.Success = false;
                response.Message = "Cliente no encontrado";
                return response;
            }

            response.Data = _mapper.Map<CustomerDto>(customer);
            response.Message = "Cliente obtenido correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al obtener cliente: {ex.Message}";
        }

        return response;
    }

        // CREATE
        public async Task<ApiResponse<CustomerDto>> Create(CustomerDto dto)
    {
        var response = new ApiResponse<CustomerDto>();

        try
        {
            if (string.IsNullOrWhiteSpace(dto.fullName))
            {
                response.Success = false;
                response.Message = "El nombre del cliente es obligatorio";
                return response;
            }

            var customer = _mapper.Map<Customer>(dto);
            customer.IsActive = true;
            customer.CreatedAt = DateTime.UtcNow;

            await _repositoryCustomer.AddAsync(customer);

            await _logHelper.LogCreate(
                tableName: "Customers",
                recordId: customer.CustomerId,
                newValue: JsonSerializer.Serialize(customer)
            );

            response.Data = _mapper.Map<CustomerDto>(customer);
            response.Message = "Cliente creado correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al crear cliente: {ex.Message}";
        }

        return response;
    }

        // UPDATE
        public async Task<ApiResponse<CustomerDto>> Update(CustomerDto dto)
    {
        var response = new ApiResponse<CustomerDto>();

        try
        {
            var customer = await _repositoryCustomer
                .FirstOrDefaultAsync(c => c.CustomerId == dto.customerId && c.DeletedAt == null);

            if (customer == null)
            {
                response.Success = false;
                response.Message = "Cliente no encontrado";
                return response;
            }

            var previousSnapshot = JsonSerializer.Serialize(customer);

            customer.FullName = dto.fullName;
            customer.Email = dto.email;
            customer.Phone = dto.phone;
            customer.Classification = dto.classification;
            customer.ActivityScore = dto.activityScore;
            customer.LastQuoteDate = dto.lastQuoteDate;
            customer.UserId = dto.userId;
            customer.IsActive = dto.isActive;
            customer.UpdatedAt = DateTime.UtcNow;

            _repositoryCustomer.Update(customer);
            await _repositoryCustomer.SaveAsync();

            await _logHelper.LogUpdate(
                tableName: "Customers",
                recordId: customer.CustomerId,
                previousValue: previousSnapshot,
                newValue: JsonSerializer.Serialize(customer)
            );

            response.Data = _mapper.Map<CustomerDto>(customer);
            response.Message = "Cliente actualizado correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al actualizar cliente: {ex.Message}";
        }

        return response;
    }

        // DELETE (SOFT)
        public async Task<ApiResponse<bool>> Delete(int id)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var customer = await _repositoryCustomer
                .FirstOrDefaultAsync(c => c.CustomerId == id && c.DeletedAt == null);

            if (customer == null)
            {
                response.Success = false;
                response.Message = "Cliente no encontrado";
                return response;
            }

            var previousSnapshot = JsonSerializer.Serialize(customer);

            customer.DeletedAt = DateTime.UtcNow;
            customer.IsActive = false;

            _repositoryCustomer.Update(customer);
            await _repositoryCustomer.SaveAsync();

            await _logHelper.LogDelete(
                tableName: "Customers",
                recordId: id,
                previousValue: previousSnapshot
            );

            response.Data = true;
            response.Message = "Cliente eliminado correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al eliminar cliente: {ex.Message}";
        }

        return response;
    }
}
