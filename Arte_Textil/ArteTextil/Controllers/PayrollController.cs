using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[Authorize(Policy = "AdminOnly")]
[ApiController]
[Route("api/[controller]")]
public class PayrollController : ControllerBase
{
    private readonly PayrollBusiness _business;

    public PayrollController(PayrollBusiness business)
    {
        _business = business;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] PayrollGenerateDto dto)
    {
        var result = await _business.GeneratePayroll(dto.Year, dto.Month);

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _business.GetAll();

        if (!result.Success) return StatusCode(500, result);

        return Ok(result);
    }

    [HttpPut("approve/{id}")]
    public async Task<IActionResult> Approve(int id)
    {
        if (!int.TryParse(User.FindFirst("id")?.Value, out var adminId))
            return Unauthorized("Token sin id válido");

        var result = await _business.Approve(id, adminId);

        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("process/{id}")]
    public async Task<IActionResult> Process(int id, [FromBody] ProcessPayrollDto dto)
    {
        if (!int.TryParse(User.FindFirst("id")?.Value, out var adminId))
            return Unauthorized("Token sin id válido");

        var result = await _business.ProcessPayroll(id, adminId, dto.Method);

        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

}
