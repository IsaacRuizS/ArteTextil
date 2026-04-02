using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers
{
    [Authorize(Policy = "AdminOnly")]
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly OrderBusiness _orderBusiness;

        public OrderController(OrderBusiness orderBusiness)
        {
            _orderBusiness = orderBusiness;
        }

        // GET: api/order/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _orderBusiness.GetAll();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/order/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _orderBusiness.GetById(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // POST: api/order
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderDto dto)
        {
            var result = await _orderBusiness.Create(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // PUT: api/order/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] OrderDto dto)
        {
            var result = await _orderBusiness.Update(id, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // PATCH: api/order/{id}/active
        [HttpPatch("{id}/active")]
        public async Task<IActionResult> UpdateIsActive(int id, [FromBody] bool isActive)
        {
            var result = await _orderBusiness.UpdateIsActive(id, isActive);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // GET: api/order/{orderId}/status-history
        [HttpGet("{orderId}/status-history")]
        public async Task<IActionResult> GetOrderStatusHistory(int orderId)
        {
            var result = await _orderBusiness.GetOrderStatusHistory(orderId);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}