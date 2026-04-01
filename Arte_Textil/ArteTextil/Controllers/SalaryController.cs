using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[Authorize] // no solo admin
[ApiController]
[Route("api/[controller]")]
public class SalaryController : ControllerBase
{
    private readonly SalaryBusiness _business;

    public SalaryController(SalaryBusiness business)
    {
        _business = business;
    }

    // SOLO ADMIN CREA
    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SalaryDto dto)
    {
        var result = await _business.Create(dto);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    // SOLO ADMIN ACTUALIZA
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SalaryDto dto)
    {
        var result = await _business.Update(id, dto);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    // TODOS pueden ver (pero filtrado)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = int.Parse(User.FindFirst("id")!.Value);
        var roleId = User.FindFirst("roleId")!.Value;

        var result = await _business.GetAll(userId, roleId);

        return Ok(result);
    }
}