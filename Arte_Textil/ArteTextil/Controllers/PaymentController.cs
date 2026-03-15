using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[Authorize(Policy = "AdminOnly")]
[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly PaymentBusiness _business;

    public PaymentController(PaymentBusiness business)
    {
        _business = business;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PaymentDto dto)
    {
        var result = await _business.Create(dto);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _business.GetAll();

        return Ok(result);
    }
}