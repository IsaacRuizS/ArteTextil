using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.DTOs.Inventario;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArteTextil.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialController : ControllerBase
    {
        private readonly ArteTextilDbContext _context;

        public MaterialController(ArteTextilDbContext context)
        {
            _context = context;
        }

        // Catálogo de materiales con filtros
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MaterialDto>>> ObtenerMateriales(
            [FromQuery] string? estado = null,
            [FromQuery] string? categoria = null,
            [FromQuery] string? busqueda = null)
        {
            var query = _context.Materiales.AsQueryable();

            // Filtro por estado
            if (!string.IsNullOrWhiteSpace(estado) && estado != "TODOS")
            {
                query = query.Where(m => m.Estado == estado);
            }

            // Filtro por categoría
            if (!string.IsNullOrWhiteSpace(categoria) && categoria != "TODOS")
            {
                query = query.Where(m => m.Categoria == categoria);
            }

            // Filtro por búsqueda (código o nombre)
            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                query = query.Where(m =>
                    m.Codigo.Contains(busqueda) ||
                    m.Nombre.Contains(busqueda));
            }

            var materiales = await query
                .Select(m => new MaterialDto
                {
                    MaterialId = m.MaterialId,
                    Codigo = m.Codigo,
                    Nombre = m.Nombre,
                    Categoria = m.Categoria,
                    UnidadMedida = m.UnidadMedida,
                    CantidadActual = m.CantidadActual,
                    Ubicacion = m.Ubicacion,
                    Estado = m.Estado,
                    StockMinimo = m.StockMinimo,
                    FechaUltimoMovimiento = m.FechaUltimoMovimiento,
                    Observaciones = m.Observaciones
                })
                .ToListAsync();

            return Ok(materiales);
        }

        // Detalle individual de material
        [HttpGet("{id}")]
        public async Task<ActionResult<MaterialDto>> ObtenerMaterialPorId(int id)
        {
            var material = await _context.Materiales
                .Where(m => m.MaterialId == id)
                .Select(m => new MaterialDto
                {
                    MaterialId = m.MaterialId,
                    Codigo = m.Codigo,
                    Nombre = m.Nombre,
                    Categoria = m.Categoria,
                    UnidadMedida = m.UnidadMedida,
                    CantidadActual = m.CantidadActual,
                    Ubicacion = m.Ubicacion,
                    Estado = m.Estado,
                    StockMinimo = m.StockMinimo,
                    FechaUltimoMovimiento = m.FechaUltimoMovimiento,
                    Observaciones = m.Observaciones
                })
                .FirstOrDefaultAsync();

            if (material == null)
            {
                return NotFound(new { message = "Material no encontrado" });
            }

            return Ok(material);
        }

        // Historial de movimientos de un material
        [HttpGet("{id}/movimientos")]
        public async Task<ActionResult<IEnumerable<MovimientoMaterialDto>>> ObtenerHistorialMovimientos(int id)
        {
            var material = await _context.Materiales.FindAsync(id);
            if (material == null)
            {
                return NotFound(new { message = "Material no encontrado" });
            }

            var movimientos = await _context.MovimientosInventario
                .Where(m => m.MaterialId == id)
                .OrderByDescending(m => m.FechaMovimiento)
                .Select(m => new MovimientoMaterialDto
                {
                    MovimientoId = m.MovimientoId,
                    MaterialId = m.MaterialId,
                    MaterialNombre = material.Nombre,
                    Tipo = m.Tipo,
                    Cantidad = m.Cantidad,
                    FechaMovimiento = m.FechaMovimiento,
                    Descripcion = m.Descripcion,
                    EstadoAnterior = m.EstadoAnterior,
                    EstadoNuevo = m.EstadoNuevo
                })
                .ToListAsync();

            return Ok(movimientos);
        }

        // Crear nuevo material
        [HttpPost]
        public async Task<ActionResult<MaterialDto>> CrearMaterial([FromBody] CrearMaterialDto dto)
        {
            // Validar código único
            var codigoExiste = await _context.Materiales
                .AnyAsync(m => m.Codigo == dto.Codigo);

            if (codigoExiste)
            {
                return BadRequest(new { message = "El código ya existe" });
            }

            // Determinar estado inicial basado en la cantidad
            string estadoInicial = "ACTIVO";
            if (dto.CantidadActual == 0)
            {
                estadoInicial = "AGOTADO";
            }
            else if (dto.CantidadActual <= dto.StockMinimo)
            {
                estadoInicial = "BAJO_STOCK";
            }

            var material = new Material
            {
                Codigo = dto.Codigo,
                Nombre = dto.Nombre,
                Categoria = dto.Categoria,
                UnidadMedida = dto.UnidadMedida,
                CantidadActual = dto.CantidadActual,
                Ubicacion = dto.Ubicacion,
                Estado = estadoInicial,
                StockMinimo = dto.StockMinimo,
                FechaUltimoMovimiento = DateTime.Now,
                Observaciones = dto.Observaciones
            };

            _context.Materiales.Add(material);
            await _context.SaveChangesAsync();

            // Registrar movimiento inicial si tiene cantidad
            if (dto.CantidadActual > 0)
            {
                var movimiento = new MovimientoInventario
                {
                    MaterialId = material.MaterialId,
                    Tipo = "ENTRADA",
                    Cantidad = dto.CantidadActual,
                    FechaMovimiento = DateTime.Now,
                    Descripcion = "Entrada inicial de material",
                    EstadoAnterior = null,
                    EstadoNuevo = estadoInicial
                };
                _context.MovimientosInventario.Add(movimiento);
                await _context.SaveChangesAsync();
            }

            // Generar alerta si es necesario
            if (material.CantidadActual == 0)
            {
                await GenerarAlerta(material, "Material agotado");
            }
            else if (material.CantidadActual <= material.StockMinimo)
            {
                await GenerarAlerta(material, "Stock bajo");
            }

            var resultado = new MaterialDto
            {
                MaterialId = material.MaterialId,
                Codigo = material.Codigo,
                Nombre = material.Nombre,
                Categoria = material.Categoria,
                UnidadMedida = material.UnidadMedida,
                CantidadActual = material.CantidadActual,
                Ubicacion = material.Ubicacion,
                Estado = material.Estado,
                StockMinimo = material.StockMinimo,
                FechaUltimoMovimiento = material.FechaUltimoMovimiento,
                Observaciones = material.Observaciones
            };

            return CreatedAtAction(nameof(ObtenerMaterialPorId), new { id = material.MaterialId }, resultado);
        }

        // Registrar movimiento de material (ENTRADA, SALIDA, AJUSTE)
        [HttpPost("{id}/movimiento")]
        public async Task<ActionResult> RegistrarMovimiento(int id, [FromBody] RegistrarMovimientoMaterialDto dto)
        {
            var material = await _context.Materiales.FindAsync(id);
            if (material == null)
            {
                return NotFound(new { message = "Material no encontrado" });
            }

            var cantidadAnterior = material.CantidadActual;
            var estadoAnterior = material.Estado;
            decimal nuevaCantidad = cantidadAnterior;

            // Calcular nueva cantidad según tipo de movimiento
            switch (dto.Tipo.ToUpper())
            {
                case "ENTRADA":
                    nuevaCantidad = cantidadAnterior + dto.Cantidad;
                    break;
                case "SALIDA":
                    if (cantidadAnterior < dto.Cantidad)
                    {
                        return BadRequest(new { message = "Cantidad insuficiente para realizar la salida" });
                    }
                    nuevaCantidad = cantidadAnterior - dto.Cantidad;
                    break;
                case "AJUSTE":
                    nuevaCantidad = dto.Cantidad;
                    break;
                default:
                    return BadRequest(new { message = "Tipo de movimiento inválido. Use ENTRADA, SALIDA o AJUSTE" });
            }

            // Actualizar cantidad del material
            material.CantidadActual = nuevaCantidad;
            material.FechaUltimoMovimiento = DateTime.Now;

            // Determinar nuevo estado
            string nuevoEstado = material.Estado;
            if (nuevaCantidad == 0)
            {
                nuevoEstado = "AGOTADO";
            }
            else if (nuevaCantidad <= material.StockMinimo)
            {
                nuevoEstado = "BAJO_STOCK";
            }
            else
            {
                nuevoEstado = "ACTIVO";
            }

            material.Estado = nuevoEstado;

            // Registrar movimiento
            var movimiento = new MovimientoInventario
            {
                MaterialId = id,
                Tipo = dto.Tipo.ToUpper(),
                Cantidad = dto.Cantidad,
                FechaMovimiento = DateTime.Now,
                Descripcion = dto.Descripcion,
                EstadoAnterior = estadoAnterior != nuevoEstado ? estadoAnterior : null,
                EstadoNuevo = estadoAnterior != nuevoEstado ? nuevoEstado : null
            };

            _context.MovimientosInventario.Add(movimiento);
            await _context.SaveChangesAsync();

            // Generar alerta si es necesario
            if (material.CantidadActual == 0)
            {
                await GenerarAlerta(material, "Material agotado después del movimiento");
            }
            else if (material.CantidadActual <= material.StockMinimo && estadoAnterior != "BAJO_STOCK")
            {
                await GenerarAlerta(material, "Stock bajo después del movimiento");
            }

            return Ok(new
            {
                message = "Movimiento registrado exitosamente",
                cantidadAnterior,
                nuevaCantidad = material.CantidadActual,
                estadoAnterior,
                nuevoEstado = material.Estado,
                movimientoId = movimiento.MovimientoId
            });
        }

        // Cambiar estado del material con descripción
        [HttpPut("{id}/estado")]
        public async Task<ActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoMaterialDto dto)
        {
            var material = await _context.Materiales.FindAsync(id);
            if (material == null)
            {
                return NotFound(new { message = "Material no encontrado" });
            }

            var estadoAnterior = material.Estado;

            // Validar que el nuevo estado sea válido
            var estadosValidos = new[] { "ACTIVO", "BAJO_STOCK", "AGOTADO", "INACTIVO" };
            if (!estadosValidos.Contains(dto.NuevoEstado.ToUpper()))
            {
                return BadRequest(new { message = "Estado inválido. Use: ACTIVO, BAJO_STOCK, AGOTADO o INACTIVO" });
            }

            material.Estado = dto.NuevoEstado.ToUpper();
            material.FechaUltimoMovimiento = DateTime.Now;

            // Registrar cambio de estado como movimiento
            var movimiento = new MovimientoInventario
            {
                MaterialId = id,
                Tipo = "CAMBIO_ESTADO",
                Cantidad = 0,
                FechaMovimiento = DateTime.Now,
                Descripcion = dto.DescripcionMovimiento,
                EstadoAnterior = estadoAnterior,
                EstadoNuevo = material.Estado
            };

            _context.MovimientosInventario.Add(movimiento);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Estado cambiado exitosamente",
                estadoAnterior,
                nuevoEstado = material.Estado,
                movimientoId = movimiento.MovimientoId
            });
        }

        // Actualizar datos del material
        [HttpPut("{id}")]
        public async Task<ActionResult> ActualizarMaterial(int id, [FromBody] ActualizarMaterialDto dto)
        {
            var material = await _context.Materiales.FindAsync(id);
            if (material == null)
            {
                return NotFound(new { message = "Material no encontrado" });
            }

            // Actualizar solo los campos proporcionados
            if (!string.IsNullOrWhiteSpace(dto.Nombre))
                material.Nombre = dto.Nombre;

            if (!string.IsNullOrWhiteSpace(dto.Categoria))
                material.Categoria = dto.Categoria;

            if (!string.IsNullOrWhiteSpace(dto.UnidadMedida))
                material.UnidadMedida = dto.UnidadMedida;

            if (dto.CantidadActual.HasValue)
                material.CantidadActual = dto.CantidadActual.Value;

            if (!string.IsNullOrWhiteSpace(dto.Ubicacion))
                material.Ubicacion = dto.Ubicacion;

            if (dto.StockMinimo.HasValue)
                material.StockMinimo = dto.StockMinimo.Value;

            if (!string.IsNullOrWhiteSpace(dto.Observaciones))
                material.Observaciones = dto.Observaciones;

            material.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Material actualizado exitosamente" });
        }

        // Obtener alertas de materiales con cantidad = 0
        [HttpGet("alertas")]
        public async Task<ActionResult> ObtenerAlertas()
        {
            var materialesAgotados = await _context.Materiales
                .Where(m => m.CantidadActual == 0)
                .Select(m => new
                {
                    materialId = m.MaterialId,
                    codigo = m.Codigo,
                    nombre = m.Nombre,
                    categoria = m.Categoria,
                    ubicacion = m.Ubicacion,
                    estado = m.Estado,
                    fechaUltimoMovimiento = m.FechaUltimoMovimiento
                })
                .ToListAsync();

            var materialesBajoStock = await _context.Materiales
                .Where(m => m.CantidadActual > 0 && m.CantidadActual <= m.StockMinimo)
                .Select(m => new
                {
                    materialId = m.MaterialId,
                    codigo = m.Codigo,
                    nombre = m.Nombre,
                    categoria = m.Categoria,
                    cantidadActual = m.CantidadActual,
                    stockMinimo = m.StockMinimo,
                    ubicacion = m.Ubicacion,
                    estado = m.Estado,
                    fechaUltimoMovimiento = m.FechaUltimoMovimiento
                })
                .ToListAsync();

            return Ok(new
            {
                materialesAgotados = new
                {
                    total = materialesAgotados.Count,
                    materiales = materialesAgotados
                },
                materialesBajoStock = new
                {
                    total = materialesBajoStock.Count,
                    materiales = materialesBajoStock
                }
            });
        }

        // Exportar inventario a Excel (simulación - retorna CSV)
        [HttpGet("exportar")]
        public async Task<IActionResult> ExportarInventario(
            [FromQuery] string? estado = null,
            [FromQuery] string? categoria = null)
        {
            var query = _context.Materiales.AsQueryable();

            if (!string.IsNullOrWhiteSpace(estado) && estado != "TODOS")
                query = query.Where(m => m.Estado == estado);

            if (!string.IsNullOrWhiteSpace(categoria) && categoria != "TODOS")
                query = query.Where(m => m.Categoria == categoria);

            var materiales = await query.ToListAsync();

            // Generar CSV
            var csv = new System.Text.StringBuilder();
            csv.AppendLine("Codigo,Nombre,Categoria,UnidadMedida,CantidadActual,StockMinimo,Ubicacion,Estado,FechaUltimoMovimiento,Observaciones");

            foreach (var m in materiales)
            {
                csv.AppendLine($"{m.Codigo},{m.Nombre},{m.Categoria},{m.UnidadMedida},{m.CantidadActual},{m.StockMinimo},{m.Ubicacion},{m.Estado},{m.FechaUltimoMovimiento:yyyy-MM-dd},{m.Observaciones}");
            }

            var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", $"inventario_{DateTime.Now:yyyyMMdd}.csv");
        }

        // Método auxiliar para generar alertas
        private async Task GenerarAlerta(Material material, string mensaje)
        {
            var alerta = new DashboardAlert
            {
                Type = material.CantidadActual == 0 ? "MaterialAgotado" : "StockBajo",
                Description = $"{mensaje}: {material.Nombre} (Código: {material.Codigo})",
                RelatedEntityId = material.MaterialId,
                IsRead = false,
                IsActive = true
            };
            _context.DashboardAlerts.Add(alerta);
            await _context.SaveChangesAsync();
        }
    }
}
