using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ArteTextil.Controllers;

[Authorize] // tengo que cambiarlo por solo colaboladores y admin, pero lo dejo así para probar
[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly AttendanceBusiness _business;

    public AttendanceController(AttendanceBusiness business)
    {
        _business = business;
    }

    private int? GetUserIdFromToken()
    {
        var claim = User.FindFirst("id");  

        if (claim == null) return null;

        if (!int.TryParse(claim.Value, out var id))
            return null;

        return id;
    }

    // POST: api/attendance/check-in
    [HttpPost("check-in")]
    public async Task<IActionResult> CheckIn()
    {
        var userId = GetUserIdFromToken();

        if (userId == null)
            return Unauthorized("Token sin id válido");

        var result = await _business.CheckIn(userId.Value);

        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // POST: api/attendance/check-out
    [HttpPost("check-out")]
    public async Task<IActionResult> CheckOut()
    {
        var userId = GetUserIdFromToken();

        if (userId == null)
            return Unauthorized("Token sin id válido");

        var result = await _business.CheckOut(userId.Value);

        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // GET: api/attendance/all
    [Authorize(Policy = "AdminOnly")]   // admin
    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _business.GetAll();
        if (!result.Success) return StatusCode(500, result);
        return Ok(result);
    }

    // Registro de asistencia por usuario (ADMIN)
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("admin")]
    public async Task<IActionResult> CreateForUser([FromBody] AttendanceDto dto)
    {
        var result = await _business.CreateForUser(dto);

        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

    // Editar asistencia por usuario (ADMIN)
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] AttendanceDto dto)
    {
        var result = await _business.Update(id, dto);

        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

}