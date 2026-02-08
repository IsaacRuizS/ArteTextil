using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace ArteTextil.Business
{
    public class UserBusiness
    {
        private readonly IRepositoryUser _repositoryUser;
        private readonly IMapper _mapper;
        private readonly ISystemLogHelper _logHelper;

        public UserBusiness(
            ArteTextilDbContext context,
            IMapper mapper,
            ISystemLogHelper logHelper)
        {
            _repositoryUser = new RepositoryUser(context);
            _mapper = mapper;
            _logHelper = logHelper;
        }

        // GET ALL
        public async Task<ApiResponse<List<UserDto>>> GetAll()
        {
            var response = new ApiResponse<List<UserDto>>();

            try
            {
                var users = await _repositoryUser.GetAllAsync(s => s.DeletedAt == null);

                response.Data = _mapper.Map<List<UserDto>>(users);
                response.Message = "Usuarios obtenidos correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener usuarios: {ex.Message}";
            }

            return response;
        }

        // GET BY ID
        public async Task<ApiResponse<UserDto>> GetById(int id)
        {
            var response = new ApiResponse<UserDto>();

            try
            {
                var user = await _repositoryUser.FirstOrDefaultAsync(s => s.UserId == id && s.DeletedAt == null);

                if (user == null)
                {
                    response.Success = false;
                    response.Message = "usuario no encontrado";
                    return response;
                }

                response.Data = _mapper.Map<UserDto>(user);
                response.Message = "usuario obtenido correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener usuario: {ex.Message}";
            }

            return response;
        }

        // CREATE
        public async Task<ApiResponse<UserDto>> Create(UserDto dto)
        {
            var response = new ApiResponse<UserDto>();

            try
            {
                if (string.IsNullOrWhiteSpace(dto.fullName) || string.IsNullOrWhiteSpace(dto.email) ||
                    string.IsNullOrWhiteSpace(dto.passwordHash) || string.IsNullOrWhiteSpace(dto.phone)
                    )
                {
                    response.Success = false;
                    response.Message = "Se deben llenar todos los campos.";
                    return response;
                }

                if (!new EmailAddressAttribute().IsValid(dto.email))
                {
                    response.Success = false;
                    response.Message = "El correo no tiene un formato válido";
                    return response;
                }

                var exists = await _repositoryUser.AnyAsync(s => s.Email == dto.email && s.DeletedAt == null);

                if (exists)
                {
                    response.Success = false;
                    response.Message = "Ya existe un usuario con ese correo registrado.";
                    return response;
                }

                var user = _mapper.Map<User>(dto);
                user.IsActive = true;
                user.CreatedAt = DateTime.UtcNow;
                var hasher = new PasswordHasher<User>();
                user.PasswordHash = hasher.HashPassword(user, dto.passwordHash);

                await _repositoryUser.AddAsync(user);

                await _logHelper.LogCreate(
                    tableName: "Users",
                    recordId: user.UserId,
                    newValue: JsonSerializer.Serialize(user)
                );

                response.Data = _mapper.Map<UserDto>(user);
                response.Message = "usuario creado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al crear usuario: {ex.Message}";
            }

            return response;
        }

        // UPDATE
        public async Task<ApiResponse<UserDto>> Update(int id, UserDto dto)
        {
            var response = new ApiResponse<UserDto>();

            try
            {
                var user = await _repositoryUser.FirstOrDefaultAsync(s => s.UserId == id && s.DeletedAt == null);

                if (user == null)
                {
                    response.Success = false;
                    response.Message = "usuario no encontrado";
                    return response;
                }

                if (!string.IsNullOrWhiteSpace(dto.email) &&
                    !new EmailAddressAttribute().IsValid(dto.email))
                {
                    response.Success = false;
                    response.Message = "El correo no tiene un formato válido";
                    return response;
                }

                var emailExists = await _repositoryUser.AnyAsync(
                    s => s.Email == dto.email && s.UserId != id && s.DeletedAt == null);

                if (emailExists)
                {
                    response.Success = false;
                    response.Message = "Ya existe otro usuario con ese correo";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(user);

                user.FullName = dto.fullName;
                user.Email = dto.email;
                user.Phone = dto.phone;
                user.LastLoginAt = dto.lastLoginAt;
                user.RoleId = dto.roleId;
                user.IsActive = dto.isActive;
                user.UpdatedAt = DateTime.UtcNow;

                if (!string.IsNullOrWhiteSpace(dto.passwordHash))
                {
                    var hasher = new PasswordHasher<User>();
                    user.PasswordHash = hasher.HashPassword(user, dto.passwordHash);
                }

                _repositoryUser.Update(user);
                await _repositoryUser.SaveAsync();

                await _logHelper.LogUpdate(
                    tableName: "Users",
                    recordId: user.UserId,
                    previousValue: previousSnapshot,
                    newValue: JsonSerializer.Serialize(user)
                );

                response.Data = _mapper.Map<UserDto>(user);
                response.Message = "usuario actualizado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al actualizar usuario: {ex.Message}";
            }

            return response;
        }

        // DELETE LÓGICO
        public async Task<ApiResponse<bool>> Delete(int id)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var user = await _repositoryUser.FirstOrDefaultAsync(s => s.UserId == id && s.DeletedAt == null);

                if (user == null)
                {
                    response.Success = false;
                    response.Message = "usuario no encontrado";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(user);

                user.IsActive = false;
                user.DeletedAt = DateTime.UtcNow;

                _repositoryUser.Update(user);
                await _repositoryUser.SaveAsync();

                await _logHelper.LogDelete(
                    tableName: "Users",
                    recordId: user.UserId,
                    previousValue: previousSnapshot
                );

                response.Data = true;
                response.Message = "usuario eliminado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al eliminar usuario: {ex.Message}";
            }

            return response;
        }
        // LOGIN
        public async Task<ApiResponse<UserDto>> Login(LoginDto dto)
        {
            var response = new ApiResponse<UserDto>();

            try
            {
                var user = await _repositoryUser.FirstOrDefaultAsync(s => s.Email == dto.email && s.DeletedAt == null);

                if (user == null)
                {
                    response.Success = false;
                    response.Message = "Credenciales incorrectas.";
                    return response;
                }

                if (!user.IsActive)
                {
                    response.Success = false;
                    response.Message = "El usuario se encuentra inactivo.";
                    return response;
                }

                var hasher = new PasswordHasher<User>();
                var result = hasher.VerifyHashedPassword(user, user.PasswordHash, dto.password);

                if (result == PasswordVerificationResult.Failed)
                {
                    response.Success = false;
                    response.Message = "Credenciales incorrectas.";
                    return response;
                }

                // Update LastLoginAt
                user.LastLoginAt = DateTime.UtcNow;
                _repositoryUser.Update(user);
                await _repositoryUser.SaveAsync();


                response.Data = _mapper.Map<UserDto>(user);
                response.Message = "Login exitoso";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error en login: {ex.Message}";
            }

            return response;
        }
    }
}
