using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[Authorize]
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
    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PayrollAdjustmentDto dto)
    {
        var result = await _business.Create(dto);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _business.GetAll();
        return Ok(result);
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        if (!int.TryParse(User.FindFirst("id")?.Value, out var userId))
            return Unauthorized("Token sin id válido");

        var result = await _business.GetByUser(userId);
        return Ok(result);
    }

    // DELETE: api/payrolladjustment/3
    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _business.Delete(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }
}
