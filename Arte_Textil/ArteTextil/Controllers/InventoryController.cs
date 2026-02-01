using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly dynamic _inventoryBusiness;

        public InventoryController(IServiceProvider serviceProvider)
        {
            // Usar MockInventoryBusiness si está registrado, sino usar el real
            _inventoryBusiness = serviceProvider.GetService<MockInventoryBusiness>() 
                ?? (dynamic)serviceProvider.GetRequiredService<InventoryBusiness>();
        }

        // GET: api/inventory
        // RF-03-001: Visualizar inventario con información detallada
        [HttpGet]
        public async Task<IActionResult> GetInventory()
        {
            var result = await _inventoryBusiness.GetInventory();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // POST: api/inventory/movement
        // RF-03-002: Registrar entradas y salidas de inventario
        [HttpPost("movement")]
        public async Task<IActionResult> RegisterMovement([FromBody] RegisterMovementDto dto)
        {
            var result = await _inventoryBusiness.RegisterMovement(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // GET: api/inventory/availability/{productId}
        // RF-03-003: Consultar disponibilidad de materiales
        [HttpGet("availability/{productId}")]
        public async Task<IActionResult> CheckAvailability(int productId)
        {
            var result = await _inventoryBusiness.CheckAvailability(productId);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // GET: api/inventory/filter
        // RF-03-004: Filtrar productos del inventario
        [HttpGet("filter")]
        public async Task<IActionResult> FilterInventory(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] bool? lowStockOnly)
        {
            var result = await _inventoryBusiness.FilterInventory(search, categoryId, lowStockOnly);

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/inventory/report
        // RF-03-005: Generar reportes de inventario
        [HttpGet("report")]
        public async Task<IActionResult> GenerateReport()
        {
            var result = await _inventoryBusiness.GenerateReport();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/inventory/alerts
        // RF-03-006: Recibir alertas por stock bajo
        [HttpGet("alerts")]
        public async Task<IActionResult> GetStockAlerts()
        {
            var result = await _inventoryBusiness.GetStockAlerts();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/inventory/movements
        // Obtener todos los movimientos
        [HttpGet("movements")]
        public async Task<IActionResult> GetAllMovements()
        {
            var result = await _inventoryBusiness.GetAllMovements();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/inventory/movements/{productId}
        // Obtener historial de movimientos de un producto
        [HttpGet("movements/{productId}")]
        public async Task<IActionResult> GetMovementHistory(int productId)
        {
            var result = await _inventoryBusiness.GetMovementHistory(productId);

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }
    }
}
