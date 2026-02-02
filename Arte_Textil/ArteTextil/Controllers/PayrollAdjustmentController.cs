using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PayrollAdjustmentController : ControllerBase
{
    private readonly PayrollAdjustmentBusiness _business;

    public PayrollAdjustmentController(PayrollAdjustmentBusiness business)
    {
        _business = business;
    }

    // POST: api/payrolladjustment
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PayrollAdjustmentDto dto)
    {
        var result = await _business.Create(dto);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // GET: api/payrolladjustment/user/5
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(int userId)
    {
        var result = await _business.GetByUser(userId);
        if (!result.Success) return StatusCode(500, result);
        return Ok(result);
    }

    // DELETE: api/payrolladjustment/3
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _business.Delete(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }
}