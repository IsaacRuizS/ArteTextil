using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ProductBusiness _productBusiness;

        public ProductController(ProductBusiness productBusiness)
        {
            _productBusiness = productBusiness;
        }

        // GET: api/product/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _productBusiness.GetAll();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/product/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _productBusiness.GetById(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // POST: api/product
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductDto dto)
        {
            var result = await _productBusiness.Create(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // PUT: api/product
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] ProductDto dto)
        {
            var result = await _productBusiness.Update(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // DELETE: api/product/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _productBusiness.Delete(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}
