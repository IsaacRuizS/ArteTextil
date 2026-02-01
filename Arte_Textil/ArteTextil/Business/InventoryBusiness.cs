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
    public class InventoryBusiness
    {
        private readonly IRepositoryInventoryMovement _repositoryInventoryMovement;
        private readonly IRepositoryBase<Product> _repositoryProduct;
        private readonly IRepositoryBase<Category> _repositoryCategory;
        private readonly IMapper _mapper;
        private readonly ISystemLogHelper _logHelper;
        private readonly ArteTextilDbContext _context;

        public InventoryBusiness(
            ArteTextilDbContext context,
            IMapper mapper,
            ISystemLogHelper logHelper)
        {
            _repositoryInventoryMovement = new RepositoryInventoryMovement(context);
            _repositoryProduct = new RepositoryBase<Product>(context);
            _repositoryCategory = new RepositoryBase<Category>(context);
            _mapper = mapper;
            _logHelper = logHelper;
            _context = context;
        }

        // RF-03-001: Visualizar inventario con información detallada
        public async Task<ApiResponse<List<InventoryItemDto>>> GetInventory()
        {
            var response = new ApiResponse<List<InventoryItemDto>>();

            try
            {
                var products = await _context.Products
                    .Include(p => p.ProductImages)
                    .Where(p => p.DeletedAt == null)
                    .Join(_context.Categories,
                        p => p.CategoryId,
                        c => c.CategoryId,
                        (p, c) => new InventoryItemDto
                        {
                            productId = p.ProductId,
                            productName = p.Name,
                            productCode = p.ProductCode,
                            stock = p.Stock,
                            minStock = p.MinStock,
                            price = p.Price,
                            status = p.Status,
                            categoryName = c.Name,
                            isLowStock = p.Stock <= p.MinStock
                        })
                    .ToListAsync();

                response.Data = products;
                response.Message = "Inventario obtenido correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener inventario: {ex.Message}";
            }

            return response;
        }

        // RF-03-002: Registrar entradas y salidas de inventario
        public async Task<ApiResponse<InventoryMovementDto>> RegisterMovement(RegisterMovementDto dto)
        {
            var response = new ApiResponse<InventoryMovementDto>();

            try
            {
                // Validar que el producto existe
                var product = await _repositoryProduct.FirstOrDefaultAsync(p => p.ProductId == dto.productId && p.DeletedAt == null);
                if (product == null)
                {
                    response.Success = false;
                    response.Message = "Producto no encontrado";
                    return response;
                }

                // Validar cantidad
                if (dto.quantity <= 0)
                {
                    response.Success = false;
                    response.Message = "La cantidad debe ser mayor a 0";
                    return response;
                }

                // Validar tipo de movimiento
                var validTypes = new[] { "Entrada", "Salida", "Ajuste" };
                if (!validTypes.Contains(dto.type))
                {
                    response.Success = false;
                    response.Message = "Tipo de movimiento inválido. Debe ser: Entrada, Salida o Ajuste";
                    return response;
                }

                // Calcular nuevo stock
                int previousStock = product.Stock;
                int newStock = previousStock;

                switch (dto.type)
                {
                    case "Entrada":
                        newStock = previousStock + dto.quantity;
                        break;
                    case "Salida":
                        if (previousStock < dto.quantity)
                        {
                            response.Success = false;
                            response.Message = $"Stock insuficiente. Stock actual: {previousStock}";
                            return response;
                        }
                        newStock = previousStock - dto.quantity;
                        break;
                    case "Ajuste":
                        newStock = dto.quantity; // En ajuste, la cantidad es el nuevo stock
                        break;
                }

                // Crear movimiento
                var movement = new InventoryMovement
                {
                    ProductId = dto.productId,
                    Type = dto.type,
                    Quantity = dto.quantity,
                    Reason = dto.reason,
                    PreviousStock = previousStock,
                    NewStock = newStock,
                    PerformedByUserId = dto.performedByUserId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _repositoryInventoryMovement.AddAsync(movement);

                // Actualizar stock del producto
                product.Stock = newStock;
                product.UpdatedAt = DateTime.UtcNow;
                _repositoryProduct.Update(product);

                await _repositoryInventoryMovement.SaveAsync();

                await _logHelper.LogCreate(
                    tableName: "InventoryMovements",
                    recordId: movement.MovementId,
                    newValue: JsonSerializer.Serialize(movement)
                );

                var movementDto = _mapper.Map<InventoryMovementDto>(movement);
                movementDto.productName = product.Name;
                movementDto.productCode = product.ProductCode;

                response.Data = movementDto;
                response.Message = "Movimiento registrado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al registrar movimiento: {ex.Message}";
            }

            return response;
        }

        // RF-03-003: Consultar disponibilidad de materiales
        public async Task<ApiResponse<InventoryItemDto>> CheckAvailability(int productId)
        {
            var response = new ApiResponse<InventoryItemDto>();

            try
            {
                var product = await _context.Products
                    .Include(p => p.ProductImages)
                    .Where(p => p.ProductId == productId && p.DeletedAt == null)
                    .Join(_context.Categories,
                        p => p.CategoryId,
                        c => c.CategoryId,
                        (p, c) => new InventoryItemDto
                        {
                            productId = p.ProductId,
                            productName = p.Name,
                            productCode = p.ProductCode,
                            stock = p.Stock,
                            minStock = p.MinStock,
                            price = p.Price,
                            status = p.Status,
                            categoryName = c.Name,
                            isLowStock = p.Stock <= p.MinStock
                        })
                    .FirstOrDefaultAsync();

                if (product == null)
                {
                    response.Success = false;
                    response.Message = "Producto no encontrado";
                    return response;
                }

                response.Data = product;
                response.Message = "Disponibilidad consultada correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al consultar disponibilidad: {ex.Message}";
            }

            return response;
        }

        // RF-03-004: Filtrar productos del inventario
        public async Task<ApiResponse<List<InventoryItemDto>>> FilterInventory(string? search, int? categoryId, bool? lowStockOnly)
        {
            var response = new ApiResponse<List<InventoryItemDto>>();

            try
            {
                var query = _context.Products
                    .Include(p => p.ProductImages)
                    .Where(p => p.DeletedAt == null)
                    .AsQueryable();

                // Filtro por búsqueda
                if (!string.IsNullOrWhiteSpace(search))
                {
                    search = search.ToLower();
                    query = query.Where(p =>
                        p.Name.ToLower().Contains(search) ||
                        (p.ProductCode != null && p.ProductCode.ToLower().Contains(search))
                    );
                }

                // Filtro por categoría
                if (categoryId.HasValue && categoryId.Value > 0)
                {
                    query = query.Where(p => p.CategoryId == categoryId.Value);
                }

                // Filtro por stock bajo
                if (lowStockOnly.HasValue && lowStockOnly.Value)
                {
                    query = query.Where(p => p.Stock <= p.MinStock);
                }

                var products = await query
                    .Join(_context.Categories,
                        p => p.CategoryId,
                        c => c.CategoryId,
                        (p, c) => new InventoryItemDto
                        {
                            productId = p.ProductId,
                            productName = p.Name,
                            productCode = p.ProductCode,
                            stock = p.Stock,
                            minStock = p.MinStock,
                            price = p.Price,
                            status = p.Status,
                            categoryName = c.Name,
                            isLowStock = p.Stock <= p.MinStock
                        })
                    .ToListAsync();

                response.Data = products;
                response.Message = "Inventario filtrado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al filtrar inventario: {ex.Message}";
            }

            return response;
        }

        // RF-03-005: Generar reportes de inventario
        public async Task<ApiResponse<InventoryReportDto>> GenerateReport()
        {
            var response = new ApiResponse<InventoryReportDto>();

            try
            {
                var products = await _context.Products
                    .Where(p => p.DeletedAt == null)
                    .Join(_context.Categories,
                        p => p.CategoryId,
                        c => c.CategoryId,
                        (p, c) => new InventoryItemDto
                        {
                            productId = p.ProductId,
                            productName = p.Name,
                            productCode = p.ProductCode,
                            stock = p.Stock,
                            minStock = p.MinStock,
                            price = p.Price,
                            status = p.Status,
                            categoryName = c.Name,
                            isLowStock = p.Stock <= p.MinStock
                        })
                    .ToListAsync();

                var report = new InventoryReportDto
                {
                    reportDate = DateTime.UtcNow,
                    totalProducts = products.Count,
                    lowStockProducts = products.Count(p => p.isLowStock && p.stock > 0),
                    outOfStockProducts = products.Count(p => p.stock == 0),
                    totalInventoryValue = products.Sum(p => p.stock * p.price),
                    items = products
                };

                response.Data = report;
                response.Message = "Reporte generado correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al generar reporte: {ex.Message}";
            }

            return response;
        }

        // RF-03-006: Recibir alertas por stock bajo
        public async Task<ApiResponse<List<StockAlertDto>>> GetStockAlerts()
        {
            var response = new ApiResponse<List<StockAlertDto>>();

            try
            {
                var alerts = await _context.Products
                    .Where(p => p.DeletedAt == null && p.Stock <= p.MinStock)
                    .Select(p => new StockAlertDto
                    {
                        productId = p.ProductId,
                        productName = p.Name,
                        productCode = p.ProductCode,
                        currentStock = p.Stock,
                        minStock = p.MinStock,
                        alertLevel = p.Stock == 0 ? "Crítico" : (p.Stock <= p.MinStock / 2 ? "Crítico" : "Bajo")
                    })
                    .OrderBy(a => a.currentStock)
                    .ToListAsync();

                response.Data = alerts;
                response.Message = $"Se encontraron {alerts.Count} alertas de stock";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener alertas: {ex.Message}";
            }

            return response;
        }

        // Obtener historial de movimientos de un producto
        public async Task<ApiResponse<List<InventoryMovementDto>>> GetMovementHistory(int productId)
        {
            var response = new ApiResponse<List<InventoryMovementDto>>();

            try
            {
                var movements = await _context.Set<InventoryMovement>()
                    .Include(m => m.Product)
                    .Include(m => m.PerformedByUser)
                    .Where(m => m.ProductId == productId && m.DeletedAt == null)
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => new InventoryMovementDto
                    {
                        movementId = m.MovementId,
                        productId = m.ProductId,
                        type = m.Type,
                        quantity = m.Quantity,
                        reason = m.Reason,
                        previousStock = m.PreviousStock,
                        newStock = m.NewStock,
                        performedByUserId = m.PerformedByUserId,
                        isActive = m.IsActive,
                        productName = m.Product != null ? m.Product.Name : null,
                        productCode = m.Product != null ? m.Product.ProductCode : null,
                        performedByUserName = m.PerformedByUser != null ? m.PerformedByUser.FullName : null,
                        createdAt = m.CreatedAt,
                        updatedAt = m.UpdatedAt
                    })
                    .ToListAsync();

                response.Data = movements;
                response.Message = "Historial obtenido correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener historial: {ex.Message}";
            }

            return response;
        }

        // Obtener todos los movimientos
        public async Task<ApiResponse<List<InventoryMovementDto>>> GetAllMovements()
        {
            var response = new ApiResponse<List<InventoryMovementDto>>();

            try
            {
                var movements = await _context.Set<InventoryMovement>()
                    .Include(m => m.Product)
                    .Include(m => m.PerformedByUser)
                    .Where(m => m.DeletedAt == null)
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => new InventoryMovementDto
                    {
                        movementId = m.MovementId,
                        productId = m.ProductId,
                        type = m.Type,
                        quantity = m.Quantity,
                        reason = m.Reason,
                        previousStock = m.PreviousStock,
                        newStock = m.NewStock,
                        performedByUserId = m.PerformedByUserId,
                        isActive = m.IsActive,
                        productName = m.Product != null ? m.Product.Name : null,
                        productCode = m.Product != null ? m.Product.ProductCode : null,
                        performedByUserName = m.PerformedByUser != null ? m.PerformedByUser.FullName : null,
                        createdAt = m.CreatedAt,
                        updatedAt = m.UpdatedAt
                    })
                    .ToListAsync();

                response.Data = movements;
                response.Message = "Movimientos obtenidos correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener movimientos: {ex.Message}";
            }

            return response;
        }
    }
}
