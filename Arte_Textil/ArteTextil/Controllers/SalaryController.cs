using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[Authorize(Policy = "AdminOnly")]
[ApiController]
[Route("api/[controller]")]
public class SalaryController : ControllerBase
{
    private readonly SalaryBusiness _business;

    public SalaryController(SalaryBusiness business)
    {
        _business = business;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SalaryDto dto)
    {
        var result = await _business.Create(dto);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    // PUT: api/salary/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SalaryDto dto)
    {
        var result = await _business.Update(id, dto);

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