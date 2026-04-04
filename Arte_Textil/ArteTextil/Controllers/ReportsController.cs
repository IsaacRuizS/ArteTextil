using ArteTextil.Business;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers
{
    [Authorize(Policy = "ReportsAccess")]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly ReportsBusiness _reportsBusiness;

        public ReportsController(ReportsBusiness reportsBusiness)
        {
            _reportsBusiness = reportsBusiness;
        }

        // GET: api/reports/inventory?stockLevel=Critical
        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventory([FromQuery] string? stockLevel)
        {
            var result = await _reportsBusiness.GetInventoryReport(stockLevel);

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/reports/sales?startDate=2025-01-01&endDate=2025-12-31&customerId=5&productId=10
        [HttpGet("sales")]
        public async Task<IActionResult> GetSales(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? customerId,
            [FromQuery] int? productId)
        {
            var result = await _reportsBusiness.GetSalesReport(startDate, endDate, customerId, productId);

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/reports/completed-orders?startDate=2025-01-01&endDate=2025-12-31&categoryId=2
        [HttpGet("completed-orders")]
        public async Task<IActionResult> GetCompletedOrders(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? categoryId)
        {
            var result = await _reportsBusiness.GetCompletedOrdersReport(startDate, endDate, categoryId);

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }
    }
}
