using ArteTextil.Business;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly AttendanceBusiness _business;

    public AttendanceController(AttendanceBusiness business)
    {
        _business = business;
    }

    // POST: api/attendance/check-in/5
    [HttpPost("check-in/{userId}")]
    public async Task<IActionResult> CheckIn(int userId)
    {
        var result = await _business.CheckIn(userId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // POST: api/attendance/check-out/5
    [HttpPost("check-out/{userId}")]
    public async Task<IActionResult> CheckOut(int userId)
    {
        var result = await _business.CheckOut(userId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // GET: api/attendance/all
    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _business.GetAll();
        if (!result.Success) return StatusCode(500, result);
        return Ok(result);
    }
}