using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ArteTextil.Business
{
    public class PromotionBusiness
    {
        private readonly IRepositoryPromotion _repositoryPromotion;
        private readonly IRepositoryProduct _repositoryProduct;
        private readonly IMapper _mapper;
        private readonly ISystemLogHelper _logHelper;

        public PromotionBusiness(
            ArteTextilDbContext context,
            IMapper mapper,
            ISystemLogHelper logHelper)
        {
            _repositoryPromotion = new RepositoryPromotion(context);
            _repositoryProduct = new RepositoryProduct(context);
            _mapper = mapper;
            _logHelper = logHelper;
        }

        // GET ALL
        public async Task<ApiResponse<List<PromotionDto>>> GetAll()
        {
            var response = new ApiResponse<List<PromotionDto>>();

            try
            {
                var promotions = await _repositoryPromotion.Query()
                    .Where(p => p.DeletedAt == null)
                    .ToListAsync();

                var promotionDtos = _mapper.Map<List<PromotionDto>>(promotions);

                // Obtener nombres de productos
                foreach (var dto in promotionDtos)
                {
                    var product = await _repositoryProduct.FirstOrDefaultAsync(p => p.ProductId == dto.productId && p.DeletedAt == null);
                    if (product != null)
                    {
                        dto.productName = product.Name;
                    }
                }

                response.Data = promotionDtos;
                response.Message = "Promociones obtenidas correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener promociones: {ex.Message}";
            }

            return response;
        }

        // GET BY ID
        public async Task<ApiResponse<PromotionDto>> GetById(int id)
        {
            var response = new ApiResponse<PromotionDto>();

            try
            {
                var promotion = await _repositoryPromotion.FirstOrDefaultAsync(p => p.PromotionId == id && p.DeletedAt == null);

                if (promotion == null)
                {
                    response.Success = false;
                    response.Message = "Promoción no encontrada";
                    return response;
                }

                var promotionDto = _mapper.Map<PromotionDto>(promotion);

                // Obtener nombre del producto
                var product = await _repositoryProduct.FirstOrDefaultAsync(p => p.ProductId == promotion.ProductId && p.DeletedAt == null);
                if (product != null)
                {
                    promotionDto.productName = product.Name;
                }

                response.Data = promotionDto;
                response.Message = "Promoción obtenida correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener promoción: {ex.Message}";
            }

            return response;
        }

        // CREATE
        public async Task<ApiResponse<PromotionDto>> Create(PromotionDto dto)
        {
            var response = new ApiResponse<PromotionDto>();

            try
            {
                if (string.IsNullOrWhiteSpace(dto.name))
                {
                    response.Success = false;
                    response.Message = "El nombre de la promoción es obligatorio";
                    return response;
                }

                if (dto.discountPercent <= 0 || dto.discountPercent > 100)
                {
                    response.Success = false;
                    response.Message = "El porcentaje de descuento debe estar entre 1 y 100";
                    return response;
                }

                // Validar que el producto exista
                var product = await _repositoryProduct.FirstOrDefaultAsync(p => p.ProductId == dto.productId && p.DeletedAt == null);
                if (product == null)
                {
                    response.Success = false;
                    response.Message = "El producto especificado no existe";
                    return response;
                }

                var promotion = _mapper.Map<Promotion>(dto);
                promotion.IsActive = true;
                promotion.CreatedAt = DateTime.UtcNow;

                await _repositoryPromotion.AddAsync(promotion);

                await _logHelper.LogCreate("Promotions", promotion.PromotionId, JsonSerializer.Serialize(promotion));

                var promotionDto = _mapper.Map<PromotionDto>(promotion);
                promotionDto.productName = product.Name;

                response.Data = promotionDto;
                response.Message = "Promoción creada correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al crear promoción: {ex.Message}";
            }

            return response;
        }

        // UPDATE
        public async Task<ApiResponse<PromotionDto>> Update(PromotionDto dto)
        {
            var response = new ApiResponse<PromotionDto>();

            try
            {
                var promotion = await _repositoryPromotion.FirstOrDefaultAsync(p => p.PromotionId == dto.promotionId && p.DeletedAt == null);

                if (promotion == null)
                {
                    response.Success = false;
                    response.Message = "Promoción no encontrada";
                    return response;
                }

                if (dto.discountPercent <= 0 || dto.discountPercent > 100)
                {
                    response.Success = false;
                    response.Message = "El porcentaje de descuento debe estar entre 1 y 100";
                    return response;
                }

                // Validar que el producto exista
                var product = await _repositoryProduct.FirstOrDefaultAsync(p => p.ProductId == dto.productId && p.DeletedAt == null);
                if (product == null)
                {
                    response.Success = false;
                    response.Message = "El producto especificado no existe";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(promotion);

                promotion.Name = dto.name;
                promotion.Description = dto.description;
                promotion.DiscountPercent = dto.discountPercent;
                promotion.StartDate = dto.startDate;
                promotion.EndDate = dto.endDate;
                promotion.ProductId = dto.productId;
                promotion.IsActive = dto.isActive;
                promotion.UpdatedAt = DateTime.UtcNow;

                _repositoryPromotion.Update(promotion);
                await _repositoryPromotion.SaveAsync();

                await _logHelper.LogUpdate("Promotions", promotion.PromotionId, previousSnapshot, JsonSerializer.Serialize(promotion));

                var promotionDto = _mapper.Map<PromotionDto>(promotion);
                promotionDto.productName = product.Name;

                response.Data = promotionDto;
                response.Message = "Promoción actualizada correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al actualizar promoción: {ex.Message}";
            }

            return response;
        }

        // ACTUALIZAR ESTADO (ACTIVO / INACTIVO)
        public async Task<ApiResponse<bool>> UpdateIsActive(int id, bool isActive)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var promotion = await _repositoryPromotion
                    .FirstOrDefaultAsync(p => p.PromotionId == id);

                if (promotion == null)
                {
                    response.Success = false;
                    response.Message = "Promoción no encontrada";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(promotion);

                promotion.IsActive = isActive;

                _repositoryPromotion.Update(promotion);
                await _repositoryPromotion.SaveAsync();

                await _logHelper.LogUpdate(
                    tableName: "Promotions",
                    recordId: promotion.PromotionId,
                    previousValue: previousSnapshot,
                    newValue: JsonSerializer.Serialize(promotion)
                );

                response.Data = true;
                response.Message = isActive
                    ? "Promoción activada correctamente"
                    : "Promoción desactivada correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al actualizar estado de la promoción: {ex.Message}";
            }

            return response;
        }

        // GET ALL Active (para marketplace)
        public async Task<ApiResponse<List<PromotionDto>>> GetAllActive()
        {
            var response = new ApiResponse<List<PromotionDto>>();

            try
            {
                var now = DateTime.UtcNow;

                var promotions = await _repositoryPromotion.Query()
                    .Where(p => p.DeletedAt == null &&
                                p.IsActive &&
                                p.StartDate <= now &&
                                (p.EndDate == null || p.EndDate >= now))
                    .ToListAsync();

                var promotionDtos = _mapper.Map<List<PromotionDto>>(promotions);

                // Obtener nombres de productos
                foreach (var dto in promotionDtos)
                {
                    var product = await _repositoryProduct.FirstOrDefaultAsync(p => p.ProductId == dto.productId && p.DeletedAt == null);
                    if (product != null)
                    {
                        dto.productName = product.Name;
                    }
                }

                response.Data = promotionDtos;
                response.Message = "Promociones activas obtenidas correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener promociones activas: {ex.Message}";
            }

            return response;
        }

        // CAMBIAR ESTADO (Activar/Desactivar)
        public async Task<ApiResponse<PromotionDto>> ChangeStatus(int id, bool isActive)
        {
            var response = new ApiResponse<PromotionDto>();

            try
            {
                var promotion = await _repositoryPromotion.FirstOrDefaultAsync(p => p.PromotionId == id && p.DeletedAt == null);

                if (promotion == null)
                {
                    response.Success = false;
                    response.Message = "Promoción no encontrada";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(promotion);

                promotion.IsActive = isActive;
                promotion.UpdatedAt = DateTime.UtcNow;

                _repositoryPromotion.Update(promotion);
                await _repositoryPromotion.SaveAsync();

                await _logHelper.LogUpdate("Promotions", promotion.PromotionId, previousSnapshot, JsonSerializer.Serialize(promotion));

                var promotionDto = _mapper.Map<PromotionDto>(promotion);

                // Obtener nombre del producto
                var product = await _repositoryProduct.FirstOrDefaultAsync(p => p.ProductId == promotion.ProductId && p.DeletedAt == null);
                if (product != null)
                {
                    promotionDto.productName = product.Name;
                }

                response.Data = promotionDto;
                response.Message = $"Promoción {(isActive ? "activada" : "desactivada")} correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al cambiar estado de promoción: {ex.Message}";
            }

            return response;
        }
    }
}
