using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuoteController : ControllerBase
    {
        private readonly QuoteBusiness _quoteBusiness;

        public QuoteController(QuoteBusiness quoteBusiness)
        {
            _quoteBusiness = quoteBusiness;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _quoteBusiness.GetAll();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _quoteBusiness.GetById(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] QuoteDto dto)
        {
            var result = await _quoteBusiness.Create(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromBody] QuoteDto dto)
        {
            var result = await _quoteBusiness.Update(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // PATCH: api/quote/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] bool isActive)
        {
            var result = await _quoteBusiness.UpdateIsActive(id, isActive);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

    }
}
