using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ArteTextil.Business
{
    public class ProductBusiness
    {
        private readonly IRepositoryProduct _repositoryProduct;
        private readonly IRepositoryCategory _repositoryCategory;
        private readonly IRepositorySupplier _repositorySupplier;
        private readonly IRepositoryProductImage _repositoryProductImage;
        private readonly IMapper _mapper;
        private readonly ISystemLogHelper _logHelper;

        public ProductBusiness(
            ArteTextilDbContext context,
            IMapper mapper,
            ISystemLogHelper logHelper)
        {
            _repositoryProduct = new RepositoryProduct(context);
            _repositoryProductImage = new RepositoryProductImage(context);
            _repositoryCategory = new RepositoryCategory(context);
            _repositorySupplier = new RepositorySupplier(context);

            _mapper = mapper;
            _logHelper = logHelper;
        }

        // GET ALL
        public async Task<ApiResponse<List<ProductDto>>> GetAll()
        {
            var response = new ApiResponse<List<ProductDto>>();

            try
            {
                var products = await _repositoryProduct.Query()
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
                var now = DateTime.UtcNow;

                var product = await _repositoryProduct.Query()
                    .Where(p => p.DeletedAt == null && p.IsActive)
                    .Include(p => p.ProductImages)
                    .Include(p => p.Promotions
                        .Where(pr =>
                            pr.IsActive &&
                            pr.DeletedAt == null &&
                            pr.StartDate <= now &&
                            (pr.EndDate == null || pr.EndDate >= now)
                        )
                    ).FirstOrDefaultAsync(p => p.ProductId == id && p.DeletedAt == null);

                if (product == null)
                {
                    response.Success = false;
                    response.Message = "Producto no encontrado";
                    return response;
                }

                var productDto = _mapper.Map<ProductDto>(product);

                var category = await _repositoryCategory.Query().FirstOrDefaultAsync(c => c.CategoryId == product.CategoryId && c.DeletedAt == null);
                if(category != null)
                {
                    productDto.categoryName = category.Name;
                }
                var supplier = await _repositorySupplier.Query().FirstOrDefaultAsync(s => s.SupplierId == product.SupplierId && s.DeletedAt == null);
                if (supplier != null)
                {
                    productDto.supplierName = supplier.Name;
                }

                response.Data = productDto;
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
                product.Status = "Activo";

                if (dto.productImages != null && dto.productImages.Any())
                {
                    product.ProductImages = dto.productImages
                        .Select(imageDto => new ProductImage
                        {
                            ImageUrl = imageDto.imageUrl,
                            IsMain = imageDto.isMain,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        })
                        .ToList();
                }

                // Un solo insert (Product + ProductImages)
                await _repositoryProduct.AddAsync(product);

                var created = await _repositoryProduct.Query()
                    .Include(p => p.ProductImages)
                    .FirstAsync(p => p.ProductId == product.ProductId);

                await _logHelper.LogCreate(
                    tableName: "Products",
                    recordId: product.ProductId,
                    newValue: JsonSerializer.Serialize(
                        _mapper.Map<ProductDto>(created)
                    )
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

        public async Task<ApiResponse<ProductDto>> Update(ProductDto dto)
        {
            var response = new ApiResponse<ProductDto>();

            try
            {
                var product = await _repositoryProduct.Query()
                    .Include(p => p.ProductImages)
                    .FirstOrDefaultAsync(p =>
                        p.ProductId == dto.productId &&
                        p.DeletedAt == null
                    );

                if (product == null)
                {
                    response.Success = false;
                    response.Message = "Producto no encontrado";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(
                    _mapper.Map<ProductDto>(product)
                );

                product.Name = dto.name;
                product.Description = dto.description;
                product.ProductCode = dto.productCode;
                product.Price = dto.price;
                product.Stock = dto.stock;
                product.MinStock = dto.minStock;
                product.CategoryId = dto.categoryId;
                product.SupplierId = dto.supplierId;
                product.IsActive = dto.isActive;
                product.UpdatedAt = DateTime.UtcNow;

                _repositoryProduct.Update(product);

                if (dto.productImages != null)
                {
                    var dtoImages = dto.productImages.ToDictionary(i => i.productImageId);

                    // Actualizar imágenes existentes
                    foreach (var dbImg in product.ProductImages)
                    {
                        if (dtoImages.TryGetValue(dbImg.ProductImageId, out var dtoImg))
                        {
                            dbImg.ImageUrl = dtoImg.imageUrl;
                            dbImg.IsMain = dtoImg.isMain;
                            dbImg.IsActive = dtoImg.isActive;
                            dbImg.UpdatedAt = DateTime.UtcNow;
                        }
                    }

                    // Agregar nuevas imágenes (sin ID)
                    var newImages = dto.productImages
                        .Where(i => i.productImageId == 0)
                        .Select(i => new ProductImage
                        {
                            ProductId = product.ProductId,
                            ImageUrl = i.imageUrl,
                            IsMain = i.isMain,
                            IsActive = i.isActive,
                            CreatedAt = DateTime.UtcNow
                        });

                    foreach (var img in newImages)
                    {
                        product.ProductImages.Add(img);
                    }
                }

                // ---------------- VALIDAR MAIN ----------------
                var activeImages = product.ProductImages
                    .Where(i => i.IsActive)
                    .ToList();

                if (activeImages.Count(i => i.IsMain) > 1)
                {
                    // dejar solo la primera como main
                    bool mainAssigned = false;
                    foreach (var img in activeImages)
                    {
                        img.IsMain = !mainAssigned;
                        mainAssigned = true;
                    }
                }

                if (activeImages.Any() && !activeImages.Any(i => i.IsMain))
                {
                    activeImages.First().IsMain = true;
                }

                await _repositoryProduct.SaveAsync();

                var updated = await _repositoryProduct.Query()
                    .Include(p => p.ProductImages)
                    .FirstAsync(p => p.ProductId == product.ProductId);

                await _logHelper.LogUpdate(
                    tableName: "Products",
                    recordId: product.ProductId,
                    previousValue: previousSnapshot,
                    newValue: JsonSerializer.Serialize(
                        _mapper.Map<ProductDto>(updated)
                    )
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

        // ACTUALIZAR ESTADO (ACTIVO / INACTIVO)
        public async Task<ApiResponse<bool>> UpdateIsActive(int id, bool isActive)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var product = await _repositoryProduct
                    .FirstOrDefaultAsync(p => p.ProductId == id);

                if (product == null)
                {
                    response.Success = false;
                    response.Message = "Producto no encontrado";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(product);

                product.IsActive = isActive;

                _repositoryProduct.Update(product);
                await _repositoryProduct.SaveAsync();

                await _logHelper.LogUpdate(
                    tableName: "Products",
                    recordId: product.ProductId,
                    previousValue: previousSnapshot,
                    newValue: JsonSerializer.Serialize(product)
                );

                response.Data = true;
                response.Message = isActive
                    ? "Producto activado correctamente"
                    : "Producto desactivado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al actualizar estado del producto: {ex.Message}";
            }

            return response;
        }


        // GET ALL For Market
        public async Task<ApiResponse<List<ProductDto>>> GetAllForMarket()
        {
            var response = new ApiResponse<List<ProductDto>>();

            try
            {
                var now = DateTime.UtcNow;

                var products = await _repositoryProduct.Query()
                    .Where(p => p.DeletedAt == null && p.IsActive)
                    .Include(p => p.ProductImages
                    .Where(pi => pi.IsActive && pi.DeletedAt == null))
                    .Include(p => p.Promotions
                        .Where(pr =>
                            pr.IsActive &&
                            pr.DeletedAt == null &&
                            pr.StartDate <= now &&
                            (pr.EndDate == null || pr.EndDate >= now)
                        )
                    )
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
    }
}
