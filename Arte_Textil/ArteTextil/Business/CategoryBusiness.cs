using ArteTextil.DTOs;
using ArteTextil.Data.Entities;
using ArteTextil.Helpers;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ArteTextil.Business
{
    public class CategoryBusiness
    {
        private readonly ArteTextilDbContext _context;
        private readonly IMapper _mapper;
        private readonly ISystemLogHelper _logHelper;

        public CategoryBusiness(
            ArteTextilDbContext context,
            IMapper mapper,
            ISystemLogHelper logHelper)
        {
            _context = context;
            _mapper = mapper;
            _logHelper = logHelper;
        }

        // GET ALL
        public async Task<ApiResponse<List<CategoryDto>>> GetAll()
        {
            var response = new ApiResponse<List<CategoryDto>>();

            try
            {
                var categories = await _context.Categories
                    .Where(c => c.DeletedAt == null)
                    .ToListAsync();

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
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.CategoryId == id && c.DeletedAt == null);

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

                var exists = await _context.Categories.AnyAsync(c =>
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

                await _context.Categories.AddAsync(category);
                await _context.SaveChangesAsync();

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
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.CategoryId == dto.categoryId && c.DeletedAt == null);

                if (category == null)
                {
                    response.Success = false;
                    response.Message = "Categoría no encontrada";
                    return response;
                }

                var exists = await _context.Categories.AnyAsync(c =>
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

                _context.Categories.Update(category);
                await _context.SaveChangesAsync();

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
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.CategoryId == id && c.DeletedAt == null);

                if (category == null)
                {
                    response.Success = false;
                    response.Message = "Categoría no encontrada";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(category);

                category.IsActive = false;
                category.DeletedAt = DateTime.UtcNow;

                _context.Categories.Update(category);
                await _context.SaveChangesAsync();

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
    }
}
