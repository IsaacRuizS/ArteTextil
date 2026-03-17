using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace ArteTextil.Business;

public class CustomerBusiness
{
    private readonly IRepositoryCustomer _repositoryCustomer;
    private readonly IRepositoryUser _repositoryUser;
    private readonly ArteTextilDbContext _context;
    private readonly IMapper _mapper;
    private readonly ISystemLogHelper _logHelper;

    public CustomerBusiness(
        ArteTextilDbContext context,
        IMapper mapper,
        ISystemLogHelper logHelper)
    {
        _context = context;
        _repositoryCustomer = new RepositoryCustomer(context);
        _repositoryUser = new RepositoryUser(context);
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
            if (string.IsNullOrWhiteSpace(dto.fullName) || string.IsNullOrWhiteSpace(dto.email))
            {
                response.Success = false;
                response.Message = "El nombre y correo del cliente son obligatorios";
                return response;
            }

            if (!new EmailAddressAttribute().IsValid(dto.email))
            {
                response.Success = false;
                response.Message = "El correo no tiene un formato válido.";
                return response;
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Buscar si ya existe un usuario con ese correo
                var user = await _repositoryUser
                    .FirstOrDefaultAsync(u => u.Email == dto.email && u.DeletedAt == null);

                if (user == null)
                {
                    var hasher = new PasswordHasher<User>();

                    user = new User
                    {
                        FullName = dto.fullName,
                        Email = dto.email,
                        Phone = dto.phone ?? "",
                        PasswordHash = "temp",
                        RoleId = 3, // Cliente
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    // contraseña por defecto
                    user.PasswordHash = hasher.HashPassword(user, "12345678");

                    await _repositoryUser.AddAsync(user);

                    await _logHelper.LogCreate(
                        tableName: "Users",
                        recordId: user.UserId,
                        newValue: JsonSerializer.Serialize(user)
                    );
                }

                // Crear Customer
                var customer = _mapper.Map<Customer>(dto);
                customer.IsActive = true;
                customer.UserId = user.UserId;
                customer.CreatedAt = DateTime.UtcNow;

                await _repositoryCustomer.AddAsync(customer);

                await _logHelper.LogCreate(
                    tableName: "Customers",
                    recordId: customer.CustomerId,
                    newValue: JsonSerializer.Serialize(customer)
                );

                await transaction.CommitAsync();

                response.Data = _mapper.Map<CustomerDto>(customer);
                response.Message = "Cliente creado correctamente";
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
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

    // ACTUALIZAR ESTADO (ACTIVO / INACTIVO)
    public async Task<ApiResponse<bool>> UpdateIsActive(int id, bool isActive)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var customer = await _repositoryCustomer
                .FirstOrDefaultAsync(c => c.CustomerId == id);

            if (customer == null)
            {
                response.Success = false;
                response.Message = "Cliente no encontrado";
                return response;
            }

            var previousSnapshot = JsonSerializer.Serialize(customer);

            customer.IsActive = isActive;

            _repositoryCustomer.Update(customer);
            await _repositoryCustomer.SaveAsync();

            await _logHelper.LogUpdate(
                tableName: "Customers",
                recordId: customer.CustomerId,
                previousValue: previousSnapshot,
                newValue: JsonSerializer.Serialize(customer)
            );

            response.Data = true;
            response.Message = isActive
                ? "Cliente activado correctamente"
                : "Cliente desactivado correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al actualizar estado del cliente: {ex.Message}";
        }

        return response;
    }

    // OBTENER SEGMENTACIÓN DE CLIENTES
    public async Task<ApiResponse<List<CustomerSegmentDto>>> GetSegments(string? filter = null)
    {
        var response = new ApiResponse<List<CustomerSegmentDto>>();

        try
        {
            var data = _context.Customers
                .Select(c => new CustomerSegmentDto
                {
                    customerId = c.CustomerId,
                    fullName = c.FullName,
                    quotesCount = _context.Quotes.Count(q => q.CustomerId == c.CustomerId && q.DeletedAt == null),
                    lastQuote = _context.Quotes
                        .Where(q => q.CustomerId == c.CustomerId && q.DeletedAt == null)
                        .Max(q => (DateTime?)q.CreatedAt)
                })
                .ToList();

            // Segmentación
            foreach (var c in data)
            {
                if (c.quotesCount >= 5)
                    c.segment = "Frecuente";
                else if (c.lastQuote >= DateTime.UtcNow.AddDays(-30))
                    c.segment = "Nuevo";
                else if (c.lastQuote == null || c.lastQuote < DateTime.UtcNow.AddMonths(-6))
                    c.segment = "Inactivo";
                else
                    c.segment = "Normal";
            }

            // Filtro
            if (!string.IsNullOrWhiteSpace(filter))
            {
                data = data
                    .Where(x => x.segment.ToLower() == filter.ToLower())
                    .ToList();
            }

            response.Data = data;
            response.Message = "Segmentación obtenida";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

}
