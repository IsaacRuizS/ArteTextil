using ArteTextil.DTOs;
using ArteTextil.Helpers;

namespace ArteTextil.Business
{
    /// <summary>
    /// Implementación Mock del inventario que usa datos en memoria
    /// No requiere base de datos activa - Solo para desarrollo de inventario
    /// </summary>
    public class MockInventoryBusiness
    {
        private static List<InventoryItemDto> _inventoryItems = new();
        private static List<InventoryMovementDto> _movements = new();
        private static int _movementIdCounter = 1;

        public MockInventoryBusiness()
        {
            // Inicializar con datos de ejemplo si está vacío
            if (_inventoryItems.Count == 0)
            {
                InitializeSampleData();
            }
        }

        private void InitializeSampleData()
        {
            _inventoryItems = new List<InventoryItemDto>
            {
                new InventoryItemDto
                {
                    productId = 1,
                    productName = "Tela de Algodón Premium",
                    productCode = "TEL-001",
                    stock = 150,
                    minStock = 50,
                    price = 18500m, // ₡18,500
                    status = "Activo",
                    categoryName = "Telas",
                    isLowStock = false
                },
                new InventoryItemDto
                {
                    productId = 2,
                    productName = "Hilo Poliéster Blanco",
                    productCode = "HIL-002",
                    stock = 30,
                    minStock = 40,
                    price = 950m, // ₡950
                    status = "Activo",
                    categoryName = "Hilos",
                    isLowStock = true
                },
                new InventoryItemDto
                {
                    productId = 3,
                    productName = "Botones Metálicos",
                    productCode = "BOT-003",
                    stock = 0,
                    minStock = 100,
                    price = 60m, // ₡60
                    status = "Activo",
                    categoryName = "Accesorios",
                    isLowStock = true
                },
                new InventoryItemDto
                {
                    productId = 4,
                    productName = "Tela de Lino Natural",
                    productCode = "TEL-004",
                    stock = 200,
                    minStock = 30,
                    price = 22000m, // ₡22,000
                    status = "Activo",
                    categoryName = "Telas",
                    isLowStock = false
                },
                new InventoryItemDto
                {
                    productId = 5,
                    productName = "Cierre Metálico 20cm",
                    productCode = "CIE-005",
                    stock = 15,
                    minStock = 50,
                    price = 350m, // ₡350
                    status = "Activo",
                    categoryName = "Accesorios",
                    isLowStock = true
                }
            };
        }

        // RF-03-001: Visualizar inventario
        public async Task<ApiResponse<List<InventoryItemDto>>> GetInventory()
        {
            var response = new ApiResponse<List<InventoryItemDto>>
            {
                Data = _inventoryItems,
                Message = "Inventario obtenido correctamente (MOCK - Datos locales)"
            };

            return await Task.FromResult(response);
        }

        // RF-03-002: Registrar movimientos
        public async Task<ApiResponse<InventoryMovementDto>> RegisterMovement(RegisterMovementDto dto)
        {
            var response = new ApiResponse<InventoryMovementDto>();

            try
            {
                var item = _inventoryItems.FirstOrDefault(i => i.productId == dto.productId);
                if (item == null)
                {
                    response.Success = false;
                    response.Message = "Producto no encontrado";
                    return response;
                }

                if (dto.quantity <= 0)
                {
                    response.Success = false;
                    response.Message = "La cantidad debe ser mayor a 0";
                    return response;
                }

                int previousStock = item.stock;
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
                        newStock = dto.quantity;
                        break;
                    default:
                        response.Success = false;
                        response.Message = "Tipo de movimiento inválido";
                        return response;
                }

                // Actualizar stock
                item.stock = newStock;
                item.isLowStock = item.stock <= item.minStock;

                // Crear movimiento
                var movement = new InventoryMovementDto
                {
                    movementId = _movementIdCounter++,
                    productId = dto.productId,
                    type = dto.type,
                    quantity = dto.quantity,
                    reason = dto.reason,
                    previousStock = previousStock,
                    newStock = newStock,
                    performedByUserId = dto.performedByUserId,
                    isActive = true,
                    productName = item.productName,
                    productCode = item.productCode,
                    performedByUserName = "Usuario Mock",
                    createdAt = DateTime.UtcNow
                };

                _movements.Add(movement);

                response.Data = movement;
                response.Message = "Movimiento registrado correctamente (MOCK)";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error: {ex.Message}";
            }

            return await Task.FromResult(response);
        }

        // RF-03-003: Consultar disponibilidad
        public async Task<ApiResponse<InventoryItemDto>> CheckAvailability(int productId)
        {
            var response = new ApiResponse<InventoryItemDto>();

            var item = _inventoryItems.FirstOrDefault(i => i.productId == productId);
            if (item == null)
            {
                response.Success = false;
                response.Message = "Producto no encontrado";
            }
            else
            {
                response.Data = item;
                response.Message = "Disponibilidad consultada correctamente (MOCK)";
            }

            return await Task.FromResult(response);
        }

        // RF-03-004: Filtrar inventario
        public async Task<ApiResponse<List<InventoryItemDto>>> FilterInventory(string? search, int? categoryId, bool? lowStockOnly)
        {
            var filtered = _inventoryItems.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                filtered = filtered.Where(i =>
                    i.productName.ToLower().Contains(search) ||
                    (i.productCode != null && i.productCode.ToLower().Contains(search)) ||
                    (i.categoryName != null && i.categoryName.ToLower().Contains(search))
                );
            }

            if (lowStockOnly.HasValue && lowStockOnly.Value)
            {
                filtered = filtered.Where(i => i.isLowStock);
            }

            var response = new ApiResponse<List<InventoryItemDto>>
            {
                Data = filtered.ToList(),
                Message = "Inventario filtrado correctamente (MOCK)"
            };

            return await Task.FromResult(response);
        }

        // RF-03-005: Generar reporte
        public async Task<ApiResponse<InventoryReportDto>> GenerateReport()
        {
            var report = new InventoryReportDto
            {
                reportDate = DateTime.UtcNow,
                totalProducts = _inventoryItems.Count,
                lowStockProducts = _inventoryItems.Count(i => i.isLowStock && i.stock > 0),
                outOfStockProducts = _inventoryItems.Count(i => i.stock == 0),
                totalInventoryValue = _inventoryItems.Sum(i => i.stock * i.price),
                items = _inventoryItems
            };

            var response = new ApiResponse<InventoryReportDto>
            {
                Data = report,
                Message = "Reporte generado correctamente (MOCK)"
            };

            return await Task.FromResult(response);
        }

        // RF-03-006: Alertas de stock
        public async Task<ApiResponse<List<StockAlertDto>>> GetStockAlerts()
        {
            var alerts = _inventoryItems
                .Where(i => i.isLowStock)
                .Select(i => new StockAlertDto
                {
                    productId = i.productId,
                    productName = i.productName,
                    productCode = i.productCode,
                    currentStock = i.stock,
                    minStock = i.minStock,
                    alertLevel = i.stock == 0 ? "Crítico" : (i.stock <= i.minStock / 2 ? "Crítico" : "Bajo")
                })
                .OrderBy(a => a.currentStock)
                .ToList();

            var response = new ApiResponse<List<StockAlertDto>>
            {
                Data = alerts,
                Message = $"Se encontraron {alerts.Count} alertas de stock (MOCK)"
            };

            return await Task.FromResult(response);
        }

        // Obtener todos los movimientos
        public async Task<ApiResponse<List<InventoryMovementDto>>> GetAllMovements()
        {
            var response = new ApiResponse<List<InventoryMovementDto>>
            {
                Data = _movements.OrderByDescending(m => m.createdAt).ToList(),
                Message = "Movimientos obtenidos correctamente (MOCK)"
            };

            return await Task.FromResult(response);
        }

        // Obtener historial por producto
        public async Task<ApiResponse<List<InventoryMovementDto>>> GetMovementHistory(int productId)
        {
            var history = _movements
                .Where(m => m.productId == productId)
                .OrderByDescending(m => m.createdAt)
                .ToList();

            var response = new ApiResponse<List<InventoryMovementDto>>
            {
                Data = history,
                Message = "Historial obtenido correctamente (MOCK)"
            };

            return await Task.FromResult(response);
        }
    }
}
