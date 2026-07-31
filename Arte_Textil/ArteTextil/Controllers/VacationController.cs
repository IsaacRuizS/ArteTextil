using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ArteTextil.Controllers;

[Authorize]   // tambien tengo que cambiarlo luego
[ApiController]
[Route("api/[controller]")]
public class VacationController : ControllerBase
{
    private readonly VacationBusiness _business;

    public VacationController(VacationBusiness business)
    {
        _business = business;
    }

    // POST: api/vacation  (COLABORADOR)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] VacationRequestDto dto)
    {
        var claim = User.FindFirst("id");
        if (claim == null) return Unauthorized("Token sin id");

        if (!int.TryParse(claim.Value, out var tokenUserId))
            return Unauthorized("Token sin id válido");

        var roleClaim = User.FindFirst("roleId");

        bool isAdmin = roleClaim?.Value == "1";

        // Si NO es admin, siempre usar el usuario del token
        if (!isAdmin)
        {
            dto.userId = tokenUserId;
        }

        var result = await _business.Create(dto);

        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // GET: api/vacation/mine  (COLABORADOR)
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var userId = GetUserIdFromToken();
        if (userId == null) return Unauthorized();

        var result = await _business.GetByUser(userId.Value);
        if (!result.Success) return StatusCode(500, result);
        return Ok(result);
    }

    // GET: api/vacation/pending  (ADMIN / GERENTE)
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        var result = await _business.GetPending();
        if (!result.Success) return StatusCode(500, result);
        return Ok(result);
    }

    // APROBAR (ADMIN)
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("approve/{id}")]
    public async Task<IActionResult> Approve(int id)
    {
        var adminId = GetUserIdFromToken();
        if (adminId == null) return Unauthorized();

        var result = await _business.Approve(id, adminId.Value);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // RECHAZAR (ADMIN)
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("reject/{id}")]
    public async Task<IActionResult> Reject(int id)
    {
        var adminId = GetUserIdFromToken();
        if (adminId == null) return Unauthorized();

        var result = await _business.Reject(id, adminId.Value);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // GET: api/vacation/all  (ADMIN)
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _business.GetAll();
        if (!result.Success) return StatusCode(500, result);
        return Ok(result);
    }

    // GET: api/vacation/available-days  (COLABORADOR)
    [HttpGet("available-days")]
    public async Task<IActionResult> GetAvailableDays()
    {
        var userId = GetUserIdFromToken();
        if (userId == null) return Unauthorized();

        var days = await _business.GetAvailableDays(userId.Value);
        return Ok(days);
    }

    // GET: api/vacation/balance  (COLABORADOR: desglose de su propio saldo)
    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance()
    {
        var userId = GetUserIdFromToken();
        if (userId == null) return Unauthorized();

        var result = await _business.GetBalance(userId.Value);
        if (!result.Success) return NotFound(result);

        return Ok(result);
    }

    // GET: api/vacation/balances  (ADMIN: saldo de todos los colaboradores)
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("balances")]
    public async Task<IActionResult> GetAllBalances()
    {
        var result = await _business.GetAllBalances();
        if (!result.Success) return StatusCode(500, result);

        return Ok(result);
    }

    private int? GetUserIdFromToken()
    {
        var claim = User.FindFirst("id");
        if (claim == null) return null;
        return int.TryParse(claim.Value, out var id) ? id : null;
    }
}
