using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VacationController : ControllerBase
{
    private readonly VacationBusiness _business;

    public VacationController(VacationBusiness business)
    {
        _business = business;
    }

    // POST: api/vacation
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] VacationRequestDto dto)
    {
        var result = await _business.Create(dto);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // GET: api/vacation/user/5
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(int userId)
    {
        var result = await _business.GetByUser(userId);
        if (!result.Success) return StatusCode(500, result);
        return Ok(result);
    }

    // GET: api/vacation/pending
    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        var result = await _business.GetPending();
        if (!result.Success) return StatusCode(500, result);
        return Ok(result);
    }

    // PUT: api/vacation/approve/3?approvedByUserId=2
    [HttpPut("approve/{id}")]
    public async Task<IActionResult> Approve(int id, [FromQuery] int approvedByUserId)
    {
        var result = await _business.Approve(id, approvedByUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // PUT: api/vacation/reject/3?approvedByUserId=2
    [HttpPut("reject/{id}")]
    public async Task<IActionResult> Reject(int id, [FromQuery] int approvedByUserId)
    {
        var result = await _business.Reject(id, approvedByUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}