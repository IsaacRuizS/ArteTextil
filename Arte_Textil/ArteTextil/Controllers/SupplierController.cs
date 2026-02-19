using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SupplierController : ControllerBase
    {
        private readonly SupplierBusiness _supplierBusiness;

        public SupplierController(SupplierBusiness supplierBusiness)
        {
            _supplierBusiness = supplierBusiness;
        }

        // GET: api/supplier/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _supplierBusiness.GetAll();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // GET: api/supplier/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _supplierBusiness.GetById(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // POST: api/supplier
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SupplierDto dto)
        {
            var result = await _supplierBusiness.Create(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // PUT: api/supplier/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SupplierDto dto)
        {
            var result = await _supplierBusiness.Update(id, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // PATCH: api/supplier/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] bool isActive)
        {
            var result = await _supplierBusiness.UpdateIsActive(id, isActive);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // GET: api/supplier/all-active
        [HttpGet("all-active")]
        public async Task<IActionResult> GetAllActive()
        {
            var result = await _supplierBusiness.GetAllActive();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

    }
}
