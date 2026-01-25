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
    public class RolBusiness
    {
        private readonly IRepositoryRol _repositoryRol;
        private readonly IMapper _mapper;
        private readonly ISystemLogHelper _logHelper;

        public RolBusiness(
            ArteTextilDbContext context,
            IMapper mapper,
            ISystemLogHelper logHelper)
        {
            _repositoryRol = new RepositoryRol(context);
            _mapper = mapper;
            _logHelper = logHelper;
        }

        // GET ALL
        public async Task<ApiResponse<List<RolDto>>> GetAll()
        {
            var response = new ApiResponse<List<RolDto>>();

            try
            {
                var roles = await _repositoryRol.GetAllAsync(s => s.DeletedAt == null);

                response.Data = _mapper.Map<List<RolDto>>(roles);
                response.Message = "Roles obtenidos correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener roles: {ex.Message}";
            }

            return response;
        }

        // GET BY ID
        public async Task<ApiResponse<RolDto>> GetById(int id)
        {
            var response = new ApiResponse<RolDto>();

            try
            {
                var rol = await _repositoryRol.FirstOrDefaultAsync(s => s.RoleId == id && s.DeletedAt == null);

                if (rol == null)
                {
                    response.Success = false;
                    response.Message = "Rol no encontrado";
                    return response;
                }

                response.Data = _mapper.Map<RolDto>(rol);
                response.Message = "Rol obtenido correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener rol: {ex.Message}";
            }

            return response;
        }

        // CREATE
        public async Task<ApiResponse<RolDto>> Create(RolDto dto)
        {
            var response = new ApiResponse<RolDto>();

            try
            {
                if (string.IsNullOrWhiteSpace(dto.name) || string.IsNullOrWhiteSpace(dto.description))
                {
                    response.Success = false;
                    response.Message = "El nombre y descripcion son obligatorios";
                    return response;
                }

                var exists = await _repositoryRol.AnyAsync(s => s.Name == dto.name && s.DeletedAt == null);

                if (exists)
                {
                    response.Success = false;
                    response.Message = "Ya existe un rol con ese nombre";
                    return response;
                }

                var rol = _mapper.Map<Rol>(dto);
                rol.IsActive = true;
                rol.CreatedAt = DateTime.UtcNow;

                await _repositoryRol.AddAsync(rol);

                await _logHelper.LogCreate(
                    tableName: "Roles",
                    recordId: rol.RoleId,
                    newValue: JsonSerializer.Serialize(rol)
                );

                response.Data = _mapper.Map<RolDto>(rol);
                response.Message = "Rol creado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al crear el rol: {ex.Message}";
            }

            return response;
        }

        // UPDATE
        public async Task<ApiResponse<RolDto>> Update(int id, RolDto dto)
        {
            var response = new ApiResponse<RolDto>();

            try
            {
                var rol = await _repositoryRol.FirstOrDefaultAsync(s => s.RoleId == id && s.DeletedAt == null);

                if (rol == null)
                {
                    response.Success = false;
                    response.Message = "Rol no encontrado";
                    return response;
                }

                if (string.IsNullOrWhiteSpace(dto.name) &&
                    string.IsNullOrWhiteSpace(dto.description))
                {
                    response.Success = false;
                    response.Message = "El rol no tiene un formato válido";
                    return response;
                }

                var nameExists = await _repositoryRol.AnyAsync(
                    s => s.Name == dto.name && s.RoleId != id && s.DeletedAt == null);

                if (nameExists)
                {
                    response.Success = false;
                    response.Message = "Ya existe otro rol con ese nombre";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(rol);

                rol.Name = dto.name;
                rol.Description = dto.description;
                rol.IsActive = dto.isActive;
                rol.UpdatedAt = DateTime.UtcNow;

                _repositoryRol.Update(rol);
                await _repositoryRol.SaveAsync();

                await _logHelper.LogUpdate(
                    tableName: "Roles",
                    recordId: rol.RoleId,
                    previousValue: previousSnapshot,
                    newValue: JsonSerializer.Serialize(rol)
                );

                response.Data = _mapper.Map<RolDto>(rol);
                response.Message = "Rol actualizado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al actualizar rol: {ex.Message}";
            }

            return response;
        }

        // DELETE LÓGICO
        public async Task<ApiResponse<bool>> Delete(int id)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var rol = await _repositoryRol.FirstOrDefaultAsync(s => s.RoleId == id && s.DeletedAt == null);

                if (rol == null)
                {
                    response.Success = false;
                    response.Message = "Rol no encontrado";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(rol);

                rol.IsActive = false;
                rol.DeletedAt = DateTime.UtcNow;

                _repositoryRol.Update(rol);
                await _repositoryRol.SaveAsync();

                await _logHelper.LogDelete(
                    tableName: "Roles",
                    recordId: rol.RoleId,
                    previousValue: previousSnapshot
                );

                response.Data = true;
                response.Message = "Rol eliminado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al eliminar rol: {ex.Message}";
            }

            return response;
        }
    }
}
