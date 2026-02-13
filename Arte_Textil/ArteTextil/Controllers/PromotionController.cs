using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromotionController : ControllerBase
    {
        private readonly PromotionBusiness _promotionBusiness;

        public PromotionController(PromotionBusiness promotionBusiness)
        {
            _promotionBusiness = promotionBusiness;
        }

        // GET: api/promotion/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _promotionBusiness.GetAll();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/promotion/active
        [HttpGet("active")]
        public async Task<IActionResult> GetAllActive()
        {
            var result = await _promotionBusiness.GetAllActive();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/promotion/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _promotionBusiness.GetById(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // POST: api/promotion
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PromotionDto dto)
        {
            var result = await _promotionBusiness.Create(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // PUT: api/promotion/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromBody] PromotionDto dto)
        {
            var result = await _promotionBusiness.Update(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // PATCH: api/promotion/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] bool isActive)
        {
            var result = await _promotionBusiness.ChangeStatus(id, isActive);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // DELETE: api/promotion/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _promotionBusiness.Delete(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}
