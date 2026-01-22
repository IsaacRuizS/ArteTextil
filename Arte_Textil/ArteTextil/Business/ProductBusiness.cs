using ArteTextil.DTOs;
using ArteTextil.Entities;
using ArteTextil.Helpers;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ArteTextil.Business
{
    public class ProductBusiness
    {
        private readonly ArteTextilDbContext _context;
        private readonly IMapper _mapper;
        private readonly ISystemLogHelper _logHelper;

        public ProductBusiness(
            ArteTextilDbContext context,
            IMapper mapper,
            ISystemLogHelper logHelper)
        {
            _context = context;
            _mapper = mapper;
            _logHelper = logHelper;
        }

        // GET ALL
        public async Task<ApiResponse<List<ProductDto>>> GetAll()
        {
            var response = new ApiResponse<List<ProductDto>>();

            try
            {
                var products = await _context.Products
                    .Where(p => p.DeletedAt == null)
                    .Include(p => p.ProductImages)
                    .ToListAsync();

                response.Data = _mapper.Map<List<ProductDto>>(products);
                response.Message = "Productos obtenidos correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener productos: {ex.Message}";
            }

            return response;
        }

        // GET BY ID
        public async Task<ApiResponse<ProductDto>> GetById(int id)
        {
            var response = new ApiResponse<ProductDto>();

            try
            {
                var product = await _context.Products
                    .Include(p => p.ProductImages)
                    .FirstOrDefaultAsync(p => p.ProductId == id && p.DeletedAt == null);

                if (product == null)
                {
                    response.Success = false;
                    response.Message = "Producto no encontrado";
                    return response;
                }

                response.Data = _mapper.Map<ProductDto>(product);
                response.Message = "Producto obtenido correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener el producto: {ex.Message}";
            }

            return response;
        }

        // CREATE
        public async Task<ApiResponse<ProductDto>> Create(ProductDto dto)
        {
            var response = new ApiResponse<ProductDto>();

            try
            {
                if (string.IsNullOrWhiteSpace(dto.name))
                {
                    response.Success = false;
                    response.Message = "El nombre del producto es obligatorio";
                    return response;
                }

                var product = _mapper.Map<Product>(dto);
                product.IsActive = true;
                product.CreatedAt = DateTime.UtcNow;

                await _context.Products.AddAsync(product);
                await _context.SaveChangesAsync();

                // Imágenes
                if (dto.productImages != null && dto.productImages.Any())
                {
                    foreach (var imageDto in dto.productImages)
                    {
                        var image = new ProductImage
                        {
                            ProductId = product.ProductId,
                            ImageUrl = imageDto.imageUrl,
                            IsMain = imageDto.isMain,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };

                        await _context.ProductImages.AddAsync(image);
                    }

                    await _context.SaveChangesAsync();
                }

                var created = await _context.Products
                    .Include(p => p.ProductImages)
                    .FirstAsync(p => p.ProductId == product.ProductId);

                // Log de auditoría
                await _logHelper.LogCreate(
                    tableName: "Products",
                    recordId: product.ProductId,
                    newValue: JsonSerializer.Serialize(created)
                );

                response.Data = _mapper.Map<ProductDto>(created);
                response.Message = "Producto creado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al crear producto: {ex.Message}";
            }

            return response;
        }

        // UPDATE
        public async Task<ApiResponse<ProductDto>> Update(ProductDto dto)
        {
            var response = new ApiResponse<ProductDto>();

            try
            {
                var product = await _context.Products
                    .Include(p => p.ProductImages)
                    .FirstOrDefaultAsync(p => p.ProductId == dto.productId && p.DeletedAt == null);

                if (product == null)
                {
                    response.Success = false;
                    response.Message = "Producto no encontrado";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(product);

                // Actualizar campos
                product.Name = dto.name;
                product.Description = dto.description;
                product.ProductCode = dto.productCode;
                product.Price = dto.price;
                product.Stock = dto.stock;
                product.MinStock = dto.minStock;
                product.Status = dto.status;
                product.CategoryId = dto.categoryId;
                product.SupplierId = dto.supplierId;
                product.IsActive = dto.isActive;
                product.UpdatedAt = DateTime.UtcNow;

                _context.Products.Update(product);

                // Imágenes
                if (dto.productImages != null)
                {
                    var existingImages = _context.ProductImages
                        .Where(i => i.ProductId == dto.productId && i.DeletedAt == null);

                    foreach (var img in existingImages)
                    {
                        img.DeletedAt = DateTime.UtcNow;
                        img.IsActive = false;
                        _context.ProductImages.Update(img);
                    }

                    foreach (var imgDto in dto.productImages)
                    {
                        var newImg = new ProductImage
                        {
                            ProductId = dto.productId,
                            ImageUrl = imgDto.imageUrl,
                            IsMain = imgDto.isMain,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        await _context.ProductImages.AddAsync(newImg);
                    }
                }

                await _context.SaveChangesAsync();

                var updated = await _context.Products
                    .Include(p => p.ProductImages)
                    .FirstAsync(p => p.ProductId == dto.productId);

                await _logHelper.LogUpdate(
                    tableName: "Products",
                    recordId: dto.productId,
                    previousValue: previousSnapshot,
                    newValue: JsonSerializer.Serialize(updated)
                );

                response.Data = _mapper.Map<ProductDto>(updated);
                response.Message = "Producto actualizado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al actualizar producto: {ex.Message}";
            }

            return response;
        }

        // DELETE (LÓGICO)
        public async Task<ApiResponse<bool>> Delete(int id)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == id && p.DeletedAt == null);

                if (product == null)
                {
                    response.Success = false;
                    response.Message = "Producto no encontrado";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(product);

                product.DeletedAt = DateTime.UtcNow;
                product.IsActive = false;

                _context.Products.Update(product);
                await _context.SaveChangesAsync();

                await _logHelper.LogDelete(
                    tableName: "Products",
                    recordId: id,
                    previousValue: previousSnapshot
                );

                response.Data = true;
                response.Message = "Producto eliminado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al eliminar producto: {ex.Message}";
            }

            return response;
        }
    }
}
