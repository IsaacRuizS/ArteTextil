using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly CategoryBusiness _categoryBusiness;

        public CategoryController(CategoryBusiness categoryBusiness)
        {
            _categoryBusiness = categoryBusiness;
        }

        // GET: api/category/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _categoryBusiness.GetAll();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/category/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _categoryBusiness.GetById(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // POST: api/category
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CategoryDto dto)
        {
            var result = await _categoryBusiness.Create(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // PUT: api/category/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromBody] CategoryDto dto)
        {
            var result = await _categoryBusiness.Update(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // DELETE: api/category/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _categoryBusiness.Delete(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}