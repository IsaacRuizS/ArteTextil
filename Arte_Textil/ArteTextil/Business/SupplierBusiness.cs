using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace ArteTextil.Business
{
    public class SupplierBusiness
    {
        private readonly IRepositorySupplier _repositorySupplier;
        private readonly IMapper _mapper;
        private readonly ISystemLogHelper _logHelper;

        public SupplierBusiness(
            ArteTextilDbContext context,
            IMapper mapper,
            ISystemLogHelper logHelper)
        {
            _repositorySupplier = new RepositorySupplier(context);
            _mapper = mapper;
            _logHelper = logHelper;
        }

        // GET ALL
        public async Task<ApiResponse<List<SupplierDto>>> GetAll()
        {
            var response = new ApiResponse<List<SupplierDto>>();

            try
            {
                var suppliers = await _repositorySupplier.GetAllAsync(s => s.DeletedAt == null);

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
                var supplier = await _repositorySupplier.FirstOrDefaultAsync(s => s.SupplierId == id && s.DeletedAt == null);

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

                var exists = await _repositorySupplier.AnyAsync(s => s.Name == dto.name && s.DeletedAt == null);

                if (exists)
                {
                    response.Success = false;
                    response.Message = "Ya existe un proveedor con ese nombre";
                    return response;
                }

                var supplier = _mapper.Map<Supplier>(dto);
                supplier.IsActive = true;
                supplier.CreatedAt = DateTime.UtcNow;

                await _repositorySupplier.AddAsync(supplier);

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
                var supplier = await _repositorySupplier.FirstOrDefaultAsync(s => s.SupplierId == id && s.DeletedAt == null);

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

                var nameExists = await _repositorySupplier.AnyAsync(
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

                _repositorySupplier.Update(supplier);
                await _repositorySupplier.SaveAsync();

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

        // ACTUALIZAR ESTADO (ACTIVO / INACTIVO)
        public async Task<ApiResponse<bool>> UpdateIsActive(int id, bool isActive)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var supplier = await _repositorySupplier
                    .FirstOrDefaultAsync(s => s.SupplierId == id);

                if (supplier == null)
                {
                    response.Success = false;
                    response.Message = "Proveedor no encontrado";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(supplier);

                supplier.IsActive = isActive;

                _repositorySupplier.Update(supplier);
                await _repositorySupplier.SaveAsync();

                await _logHelper.LogUpdate(
                    tableName: "Suppliers",
                    recordId: supplier.SupplierId,
                    previousValue: previousSnapshot,
                    newValue: JsonSerializer.Serialize(supplier)
                );

                response.Data = true;
                response.Message = isActive
                    ? "Proveedor activado correctamente"
                    : "Proveedor desactivado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al actualizar estado del proveedor: {ex.Message}";
            }

            return response;
        }

        // GET ALL Active
        public async Task<ApiResponse<List<SupplierDto>>> GetAllActive()
        {
            var response = new ApiResponse<List<SupplierDto>>();

            try
            {
                var suppliers = await _repositorySupplier.GetAllAsync(s => s.DeletedAt == null && s.IsActive);

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
    }
}
