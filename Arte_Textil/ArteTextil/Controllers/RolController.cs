using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolController : ControllerBase
    {
        private readonly RolBusiness _rolBusiness;

        public RolController(RolBusiness rolBusiness)
        {
            _rolBusiness = rolBusiness;
        }

        // GET: api/rol/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _rolBusiness.GetAll();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/rol/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _rolBusiness.GetById(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // POST: api/rol
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RolDto dto)
        {
            var result = await _rolBusiness.Create(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // PUT: api/rol
        [HttpPut]
        public async Task<IActionResult> Update(int id, [FromBody] RolDto dto)
        {
            var result = await _rolBusiness.Update(id, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // DELETE: api/rol/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _rolBusiness.Delete(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}
