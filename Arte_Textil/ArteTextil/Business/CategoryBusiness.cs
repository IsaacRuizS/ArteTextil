using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using System.Text.Json;

namespace ArteTextil.Business
{
    public class CategoryBusiness
    {
        private readonly IRepositoryCategory _repositoryCategory;
        private readonly IMapper _mapper;
        private readonly ISystemLogHelper _logHelper;

        public CategoryBusiness(
            ArteTextilDbContext context,
            IMapper mapper,
            ISystemLogHelper logHelper)
        {
            _repositoryCategory = new RepositoryCategory(context);
            _mapper = mapper;
            _logHelper = logHelper;
        }

        // GET ALL
        public async Task<ApiResponse<List<CategoryDto>>> GetAll()
        {
            var response = new ApiResponse<List<CategoryDto>>();

            try
            {
                var categories = await _repositoryCategory.GetAllAsync(c => c.DeletedAt == null);

                response.Data = _mapper.Map<List<CategoryDto>>(categories);
                response.Message = "Categorías obtenidas correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener categorías: {ex.Message}";
            }

            return response;
        }

        // GET BY ID
        public async Task<ApiResponse<CategoryDto>> GetById(int id)
        {
            var response = new ApiResponse<CategoryDto>();

            try
            {
                var category = await _repositoryCategory.FirstOrDefaultAsync(c => c.CategoryId == id && c.DeletedAt == null);

                if (category == null)
                {
                    response.Success = false;
                    response.Message = "Categoría no encontrada";
                    return response;
                }

                response.Data = _mapper.Map<CategoryDto>(category);
                response.Message = "Categoría obtenida correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener categoría: {ex.Message}";
            }

            return response;
        }

        // CREATE
        public async Task<ApiResponse<CategoryDto>> Create(CategoryDto dto)
        {
            var response = new ApiResponse<CategoryDto>();

            try
            {
                if (string.IsNullOrWhiteSpace(dto.name))
                {
                    response.Success = false;
                    response.Message = "El nombre es obligatorio";
                    return response;
                }

                var exists = await _repositoryCategory.AnyAsync(c =>
                    c.Name == dto.name && c.DeletedAt == null);

                if (exists)
                {
                    response.Success = false;
                    response.Message = "Ya existe una categoría con ese nombre";
                    return response;
                }

                var category = _mapper.Map<Category>(dto);
                category.IsActive = true;
                category.CreatedAt = DateTime.UtcNow;

                await _repositoryCategory.AddAsync(category);

                await _logHelper.LogCreate("Categories", category.CategoryId, JsonSerializer.Serialize(category));

                response.Data = _mapper.Map<CategoryDto>(category);
                response.Message = "Categoría creada correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al crear categoría: {ex.Message}";
            }

            return response;
        }

        // UPDATE
        public async Task<ApiResponse<CategoryDto>> Update(CategoryDto dto)
        {
            var response = new ApiResponse<CategoryDto>();

            try
            {
                var category = await _repositoryCategory.FirstOrDefaultAsync(c => c.CategoryId == dto.categoryId && c.DeletedAt == null);

                if (category == null)
                {
                    response.Success = false;
                    response.Message = "Categoría no encontrada";
                    return response;
                }

                var exists = await _repositoryCategory.AnyAsync(c =>
                    c.Name == dto.name && c.CategoryId != dto.categoryId && c.DeletedAt == null);

                if (exists)
                {
                    response.Success = false;
                    response.Message = "Ya existe otra categoría con ese nombre";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(category);

                category.Name = dto.name;
                category.Description = dto.description;
                category.IsActive = dto.isActive;
                category.UpdatedAt = DateTime.UtcNow;

                _repositoryCategory.Update(category);
                await _repositoryCategory.SaveAsync();

                await _logHelper.LogUpdate("Categories", category.CategoryId, previousSnapshot, JsonSerializer.Serialize(category));

                response.Data = _mapper.Map<CategoryDto>(category);
                response.Message = "Categoría actualizada correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al actualizar categoría: {ex.Message}";
            }

            return response;
        }

        // DELETE LÓGICO
        public async Task<ApiResponse<bool>> Delete(int id)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var category = await _repositoryCategory.FirstOrDefaultAsync(c => c.CategoryId == id && c.DeletedAt == null);

                if (category == null)
                {
                    response.Success = false;
                    response.Message = "Categoría no encontrada";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(category);

                category.IsActive = false;
                category.DeletedAt = DateTime.UtcNow;

                _repositoryCategory.Update(category);
                await _repositoryCategory.SaveAsync();

                await _logHelper.LogDelete("Categories", category.CategoryId, previousSnapshot);

                response.Data = true;
                response.Message = "Categoría eliminada correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al eliminar categoría: {ex.Message}";
            }

            return response;
        }

        // GET ALL Active
        public async Task<ApiResponse<List<CategoryDto>>> GetAllActive()
        {
            var response = new ApiResponse<List<CategoryDto>>();

            try
            {
                var categories = await _repositoryCategory.GetAllAsync(c => c.DeletedAt == null && c.IsActive);

                response.Data = _mapper.Map<List<CategoryDto>>(categories);
                response.Message = "Categorías obtenidas correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener categorías: {ex.Message}";
            }

            return response;
        }
    }
}
