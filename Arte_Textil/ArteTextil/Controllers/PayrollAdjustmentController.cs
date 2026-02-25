using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[Authorize(Policy = "AdminOnly")]
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

    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _business.GetAll();
        return Ok(result);
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var userId = int.Parse(User.FindFirst("id")!.Value);
        var result = await _business.GetByUser(userId);
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