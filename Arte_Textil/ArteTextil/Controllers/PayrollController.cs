using ArteTextil.Business;
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
    public async Task<IActionResult> Generate(int year, int month)
    {
        var result = await _business.GeneratePayroll(year, month);

        if (!result.Success) return BadRequest(result);

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

        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }
}