using ArteTextil.DTOs;
using ArteTextil.Entities;
using ArteTextil.Helpers;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace ArteTextil.Business
{
    public class SupplierBusiness
    {
        private readonly ArteTextilDbContext _context;
        private readonly IMapper _mapper;
        private readonly ISystemLogHelper _logHelper;

        public SupplierBusiness(
            ArteTextilDbContext context,
            IMapper mapper,
            ISystemLogHelper logHelper)
        {
            _context = context;
            _mapper = mapper;
            _logHelper = logHelper;
        }

        // GET ALL
        public async Task<ApiResponse<List<SupplierDto>>> GetAll()
        {
            var response = new ApiResponse<List<SupplierDto>>();

            try
            {
                var suppliers = await _context.Suppliers
                    .Where(s => s.DeletedAt == null)
                    .ToListAsync();

                response.Data = _mapper.Map<List<SupplierDto>>(suppliers);
                response.Message = "Proveedores obtenidos correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener proveedores: {ex.Message}";
            }

            return response;
        }

        // GET BY ID
        public async Task<ApiResponse<SupplierDto>> GetById(int id)
        {
            var response = new ApiResponse<SupplierDto>();

            try
            {
                var supplier = await _context.Suppliers
                    .FirstOrDefaultAsync(s => s.SupplierId == id && s.DeletedAt == null);

                if (supplier == null)
                {
                    response.Success = false;
                    response.Message = "Proveedor no encontrado";
                    return response;
                }

                response.Data = _mapper.Map<SupplierDto>(supplier);
                response.Message = "Proveedor obtenido correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener proveedor: {ex.Message}";
            }

            return response;
        }

        // CREATE
        public async Task<ApiResponse<SupplierDto>> Create(SupplierDto dto)
        {
            var response = new ApiResponse<SupplierDto>();

            try
            {
                if (string.IsNullOrWhiteSpace(dto.name) || string.IsNullOrWhiteSpace(dto.email))
                {
                    response.Success = false;
                    response.Message = "El nombre y el correo son obligatorios";
                    return response;
                }

                if (!new EmailAddressAttribute().IsValid(dto.email))
                {
                    response.Success = false;
                    response.Message = "El correo no tiene un formato válido";
                    return response;
                }

                var exists = await _context.Suppliers
                    .AnyAsync(s => s.Name == dto.name && s.DeletedAt == null);

                if (exists)
                {
                    response.Success = false;
                    response.Message = "Ya existe un proveedor con ese nombre";
                    return response;
                }

                var supplier = _mapper.Map<Supplier>(dto);
                supplier.IsActive = true;
                supplier.CreatedAt = DateTime.UtcNow;

                await _context.Suppliers.AddAsync(supplier);
                await _context.SaveChangesAsync();

                await _logHelper.LogCreate(
                    tableName: "Suppliers",
                    recordId: supplier.SupplierId,
                    newValue: JsonSerializer.Serialize(supplier)
                );

                response.Data = _mapper.Map<SupplierDto>(supplier);
                response.Message = "Proveedor creado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al crear proveedor: {ex.Message}";
            }

            return response;
        }

        // UPDATE
        public async Task<ApiResponse<SupplierDto>> Update(int id, SupplierDto dto)
        {
            var response = new ApiResponse<SupplierDto>();

            try
            {
                var supplier = await _context.Suppliers
                    .FirstOrDefaultAsync(s => s.SupplierId == id && s.DeletedAt == null);

                if (supplier == null)
                {
                    response.Success = false;
                    response.Message = "Proveedor no encontrado";
                    return response;
                }

                if (!string.IsNullOrWhiteSpace(dto.email) &&
                    !new EmailAddressAttribute().IsValid(dto.email))
                {
                    response.Success = false;
                    response.Message = "El correo no tiene un formato válido";
                    return response;
                }

                var nameExists = await _context.Suppliers.AnyAsync(
                    s => s.Name == dto.name && s.SupplierId != id && s.DeletedAt == null);

                if (nameExists)
                {
                    response.Success = false;
                    response.Message = "Ya existe otro proveedor con ese nombre";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(supplier);

                supplier.Name = dto.name;
                supplier.Email = dto.email;
                supplier.Phone = dto.phone;
                supplier.ContactPerson = dto.contactPerson;
                supplier.IsActive = dto.isActive;
                supplier.UpdatedAt = DateTime.UtcNow;

                _context.Suppliers.Update(supplier);
                await _context.SaveChangesAsync();

                await _logHelper.LogUpdate(
                    tableName: "Suppliers",
                    recordId: supplier.SupplierId,
                    previousValue: previousSnapshot,
                    newValue: JsonSerializer.Serialize(supplier)
                );

                response.Data = _mapper.Map<SupplierDto>(supplier);
                response.Message = "Proveedor actualizado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al actualizar proveedor: {ex.Message}";
            }

            return response;
        }

        // DELETE LÓGICO
        public async Task<ApiResponse<bool>> Delete(int id)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var supplier = await _context.Suppliers
                    .FirstOrDefaultAsync(s => s.SupplierId == id && s.DeletedAt == null);

                if (supplier == null)
                {
                    response.Success = false;
                    response.Message = "Proveedor no encontrado";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(supplier);

                supplier.IsActive = false;
                supplier.DeletedAt = DateTime.UtcNow;

                _context.Suppliers.Update(supplier);
                await _context.SaveChangesAsync();

                await _logHelper.LogDelete(
                    tableName: "Suppliers",
                    recordId: supplier.SupplierId,
                    previousValue: previousSnapshot
                );

                response.Data = true;
                response.Message = "Proveedor eliminado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al eliminar proveedor: {ex.Message}";
            }

            return response;
        }
    }
}
