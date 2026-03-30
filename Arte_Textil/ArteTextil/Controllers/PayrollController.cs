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

        return Ok(result);
    }

    [HttpPut("approve/{id}")]
    public async Task<IActionResult> Approve(int id)
    {
        var adminId = int.Parse(User.FindFirst("id")!.Value);

        var result = await _business.Approve(id, adminId);

        return Ok(result);
    }

    [HttpPost("process/{id}")]
    public async Task<IActionResult> Process(int id, [FromBody] ProcessPayrollDto dto)
    {
        var adminId = int.Parse(User.FindFirst("id")!.Value);

        var result = await _business.ProcessPayroll(id, adminId, dto.Method);

        return Ok(result);
    }

}