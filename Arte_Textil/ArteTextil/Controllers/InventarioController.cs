using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.DTOs.Inventario;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArteTextil.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventarioController : ControllerBase
    {
        private readonly ArteTextilDbContext _context;

        public InventarioController(ArteTextilDbContext context)
        {
            _context = context;
        }

        // RF-03-001: Visualizar inventario con información detallada
        // RF-03-004: Filtrar productos del inventario
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoInventarioDto>>> ObtenerInventario(
            [FromQuery] string? estado = null,
            [FromQuery] string? categoria = null,
            [FromQuery] string? busqueda = null)
        {
            var query = _context.Products
                .Include(p => p.ProductImages)
                .AsQueryable();

            // Filtro por estado
            if (!string.IsNullOrWhiteSpace(estado) && estado != "Todos")
            {
                query = query.Where(p => p.Status == estado);
            }

            // Filtro por búsqueda (nombre o código)
            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                query = query.Where(p =>
                    p.Name.Contains(busqueda) ||
                    (p.ProductCode != null && p.ProductCode.Contains(busqueda)));
            }

            var productos = await query
                .Select(p => new ProductoInventarioDto
                {
                    ProductId = p.ProductId,
                    Codigo = p.ProductCode ?? "",
                    Nombre = p.Name,
                    Descripcion = p.Description,
                    Stock = p.Stock,
                    StockMinimo = p.MinStock,
                    Ubicacion = p.Location,
                    Estado = p.Status,
                    Precio = p.Price,
                    CategoriaId = p.CategoryId,
                    CategoriaNombre = _context.Categories
                        .Where(c => c.CategoryId == p.CategoryId)
                        .Select(c => c.Name)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(productos);
        }

        // RF-03-001: Crear nuevo producto en inventario
        [HttpPost]
        public async Task<ActionResult<ProductoInventarioDto>> CrearProducto([FromBody] CrearInventarioDto dto)
        {
            // Validar que la categoría existe y está activa
            var categoriaExiste = await _context.Categories
                .AnyAsync(c => c.CategoryId == dto.CategoriaId && c.IsActive);

            if (!categoriaExiste)
            {
                return BadRequest(new { message = "La categoría seleccionada no existe o no está activa." });
            }

            var producto = new Product
            {
                ProductCode = dto.Codigo,
                Name = dto.Nombre,
                Description = dto.Observaciones,
                Stock = dto.Cantidad,
                MinStock = dto.StockMinimo,
                Location = dto.Ubicacion,
                Status = dto.Estado ?? "Disponible",
                CategoryId = dto.CategoriaId,
                SupplierId = 1, // Default
                Price = dto.Precio ?? 0,
                IsActive = true
            };

            _context.Products.Add(producto);
            await _context.SaveChangesAsync();

            // Generar alerta si el stock es bajo
            if (producto.Stock <= producto.MinStock)
            {
                var alerta = new DashboardAlert
                {
                    Type = "StockBajo",
                    Description = $"Stock bajo: {producto.Name} ({producto.Stock} unidades)",
                    RelatedEntityId = producto.ProductId,
                    IsRead = false,
                    IsActive = true
                };
                _context.DashboardAlerts.Add(alerta);
                await _context.SaveChangesAsync();
            }

            var resultado = new ProductoInventarioDto
            {
                ProductId = producto.ProductId,
                Codigo = producto.ProductCode ?? "",
                Nombre = producto.Name,
                Descripcion = producto.Description,
                Stock = producto.Stock,
                StockMinimo = producto.MinStock,
                Ubicacion = producto.Location,
                Estado = producto.Status,
                Precio = producto.Price,
                CategoriaId = producto.CategoryId
            };

            return CreatedAtAction(nameof(ObtenerInventario), new { id = producto.ProductId }, resultado);
        }

        // RF-03-002: Registrar entradas y salidas de inventario
        [HttpPost("movimiento")]
        public async Task<ActionResult> RegistrarMovimiento([FromBody] MovimientoInventarioDto dto)
        {
            try
            {
                var producto = await _context.Products.FindAsync(dto.ProductoId);

                if (producto == null)
                {
                    return NotFound(new { message = "Producto no encontrado" });
                }

                var stockAnterior = producto.Stock;
                var nuevoStock = stockAnterior;

                if (dto.Tipo == "Entrada")
                {
                    nuevoStock += dto.Cantidad;
                }
                else if (dto.Tipo == "Salida")
                {
                    if (stockAnterior < dto.Cantidad)
                    {
                        return BadRequest(new { message = "Stock insuficiente para realizar la salida" });
                    }
                    nuevoStock -= dto.Cantidad;
                }
                else
                {
                    return BadRequest(new { message = "Tipo de movimiento inválido. Use 'Entrada' o 'Salida'" });
                }

                // Actualizar stock del producto
                producto.Stock = nuevoStock;

                // Actualizar estado del producto según el nuevo stock
                if (nuevoStock <= 0)
                {
                    producto.Status = "Agotado";
                }
                else if (nuevoStock <= producto.MinStock)
                {
                    producto.Status = "Stock Bajo";
                }
                else
                {
                    producto.Status = "Disponible";
                }

                // Registrar movimiento
                var movimiento = new InventoryMovement
                {
                    ProductId = dto.ProductoId,
                    Type = dto.Tipo,
                    Quantity = dto.Cantidad,
                    PreviousStock = stockAnterior,
                    NewStock = nuevoStock,
                    Observations = dto.Observaciones,
                    PerformedByUserId = dto.UsuarioId,
                    MovementDate = DateTime.Now
                };

                _context.InventoryMovements.Add(movimiento);

                // Generar alerta si el stock es bajo después del movimiento
                if (nuevoStock <= producto.MinStock)
                {
                    var alerta = new DashboardAlert
                    {
                        Type = "StockBajo",
                        Description = $"Stock bajo: {producto.Name} ({nuevoStock} unidades)",
                        RelatedEntityId = producto.ProductId,
                        IsRead = false,
                        IsActive = true
                    };
                    _context.DashboardAlerts.Add(alerta);
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Movimiento registrado exitosamente",
                    stockAnterior,
                    nuevoStock,
                    estado = producto.Status,
                    movimientoId = movimiento.MovementId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al registrar movimiento", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // RF-03-003: Consultar disponibilidad de materiales
        [HttpGet("disponibilidad/{codigo}")]
        public async Task<ActionResult> ConsultarDisponibilidad(string codigo)
        {
            var producto = await _context.Products
                .FirstOrDefaultAsync(p => p.ProductCode == codigo);

            if (producto == null)
            {
                return NotFound(new { message = "Producto no encontrado" });
            }

            var disponible = producto.Stock > producto.MinStock;
            var estadoStock = producto.Stock <= 0 ? "Agotado"
                : producto.Stock <= producto.MinStock ? "Stock Bajo"
                : "Disponible";

            return Ok(new
            {
                codigo = producto.ProductCode,
                nombre = producto.Name,
                stock = producto.Stock,
                stockMinimo = producto.MinStock,
                disponible,
                estadoStock,
                ubicacion = producto.Location
            });
        }

        // RF-03-005: Reporte General de Inventario
        [HttpGet("reporte/general")]
        public async Task<ActionResult> GenerarReporteGeneral()
        {
            try
            {
                var productos = await _context.Products
                    .Include(p => p.Category)
                    .Where(p => p.IsActive)
                    .ToListAsync();

                var totalProductos = productos.Count;
                var productosDisponibles = productos.Count(p => p.Stock > p.MinStock);
                var productosStockBajo = productos.Count(p => p.Stock <= p.MinStock && p.Stock > 0);
                var productosAgotados = productos.Count(p => p.Stock <= 0);
                var valorTotalInventario = productos.Sum(p => p.Price * p.Stock);

                // Productos por categoría
                var productosPorCategoria = productos
                    .GroupBy(p => p.Category?.Name ?? "Sin categoría")
                    .Select(g => new
                    {
                        categoria = g.Key,
                        cantidad = g.Count(),
                        valor = g.Sum(p => p.Price * p.Stock)
                    })
                    .ToList();

                var reporte = new
                {
                    fecha = DateTime.Now,
                    resumen = new
                    {
                        totalProductos,
                        productosDisponibles,
                        productosStockBajo,
                        productosAgotados,
                        valorTotalInventario
                    },
                    productosPorCategoria,
                    top10ProductosValor = productos
                        .OrderByDescending(p => p.Price * p.Stock)
                        .Take(10)
                        .Select(p => new
                        {
                            codigo = p.ProductCode,
                            nombre = p.Name,
                            stock = p.Stock,
                            precio = p.Price,
                            valorTotal = p.Price * p.Stock
                        })
                        .ToList()
                };

                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al generar reporte general", error = ex.Message });
            }
        }

        // RF-03-005: Reporte de Productos con Stock Bajo
        [HttpGet("reporte/stock-bajo")]
        public async Task<ActionResult> GenerarReporteStockBajo()
        {
            try
            {
                var productosStockBajo = await _context.Products
                    .Include(p => p.Category)
                    .Where(p => p.Stock <= p.MinStock && p.IsActive)
                    .OrderBy(p => p.Stock)
                    .Select(p => new
                    {
                        productoId = p.ProductId,
                        codigo = p.ProductCode,
                        nombre = p.Name,
                        categoria = p.Category != null ? p.Category.Name : "Sin categoría",
                        stock = p.Stock,
                        stockMinimo = p.MinStock,
                        diferencia = p.MinStock - p.Stock,
                        ubicacion = p.Location,
                        precio = p.Price,
                        estado = p.Stock <= 0 ? "Agotado" : "Stock Bajo",
                        prioridad = p.Stock <= 0 ? "Alta" : p.Stock <= p.MinStock / 2 ? "Media" : "Baja"
                    })
                    .ToListAsync();

                var reporte = new
                {
                    fecha = DateTime.Now,
                    totalProductosAfectados = productosStockBajo.Count,
                    productosAgotados = productosStockBajo.Count(p => p.estado == "Agotado"),
                    productos = productosStockBajo
                };

                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al generar reporte de stock bajo", error = ex.Message });
            }
        }

        // RF-03-005: Reporte de Movimientos de Inventario
        [HttpGet("reporte/movimientos")]
        public async Task<ActionResult> GenerarReporteMovimientos(
            [FromQuery] DateTime? fechaInicio = null,
            [FromQuery] DateTime? fechaFin = null)
        {
            try
            {
                // Por defecto, últimos 30 días
                fechaInicio ??= DateTime.Now.AddDays(-30);
                fechaFin ??= DateTime.Now;

                var movimientos = await _context.InventoryMovements
                    .Include(m => m.Product)
                    .Where(m => m.MovementDate >= fechaInicio && m.MovementDate <= fechaFin)
                    .OrderByDescending(m => m.MovementDate)
                    .Select(m => new
                    {
                        movimientoId = m.MovementId,
                        fecha = m.MovementDate,
                        productoNombre = m.Product != null ? m.Product.Name : "N/A",
                        productoCodigo = m.Product != null ? m.Product.ProductCode : "N/A",
                        tipo = m.Type,
                        cantidad = m.Quantity,
                        stockAnterior = m.PreviousStock,
                        stockNuevo = m.NewStock,
                        observaciones = m.Observations
                    })
                    .ToListAsync();

                var totalEntradas = movimientos.Where(m => m.tipo == "Entrada").Sum(m => m.cantidad);
                var totalSalidas = movimientos.Where(m => m.tipo == "Salida").Sum(m => m.cantidad);

                var reporte = new
                {
                    fechaInicio,
                    fechaFin,
                    resumen = new
                    {
                        totalMovimientos = movimientos.Count,
                        totalEntradas,
                        totalSalidas,
                        diferencia = totalEntradas - totalSalidas
                    },
                    movimientos
                };

                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al generar reporte de movimientos", error = ex.Message });
            }
        }

        // RF-03-006: Recibir alertas por stock bajo
        [HttpGet("alertas")]
        public async Task<ActionResult> ObtenerAlertas()
        {
            var alertas = await _context.DashboardAlerts
                .Where(a => a.IsActive && !a.IsRead)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    alertaId = a.AlertId,
                    tipo = a.Type,
                    descripcion = a.Description,
                    productoId = a.RelatedEntityId,
                    leida = a.IsRead,
                    fecha = a.CreatedAt
                })
                .ToListAsync();

            return Ok(alertas);
        }

        // Marcar alerta como leída
        [HttpPut("alertas/{id}/leer")]
        public async Task<ActionResult> MarcarAlertaLeida(int id)
        {
            var alerta = await _context.DashboardAlerts.FindAsync(id);

            if (alerta == null)
            {
                return NotFound(new { message = "Alerta no encontrada" });
            }

            alerta.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Alerta marcada como leída" });
        }

        // Obtener movimientos de un producto
        [HttpGet("movimientos/{productoId}")]
        public async Task<ActionResult> ObtenerMovimientos(int productoId)
        {
            var movimientos = await _context.InventoryMovements
                .Where(m => m.ProductId == productoId)
                .OrderByDescending(m => m.MovementDate)
                .Select(m => new
                {
                    movimientoId = m.MovementId,
                    tipo = m.Type,
                    cantidad = m.Quantity,
                    stockAnterior = m.PreviousStock,
                    stockNuevo = m.NewStock,
                    observaciones = m.Observations,
                    fecha = m.MovementDate,
                    usuarioId = m.PerformedByUserId
                })
                .ToListAsync();

            return Ok(movimientos);
        }
    }
}
