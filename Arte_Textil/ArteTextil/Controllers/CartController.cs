using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly CartBusiness _cartBusiness;

    public CartController(CartBusiness cartBusiness)
    {
        _cartBusiness = cartBusiness;
    }

    private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);

    // GET: api/cart/all — Admin / Empleado
    [HttpGet("all")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _cartBusiness.GetAll();

        if (!result.Success)
            return StatusCode(500, result);

        return Ok(result);
    }

    // GET: api/cart/{id} — Admin / Empleado
    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _cartBusiness.GetById(id);

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    // GET: api/cart/my — Customer: obtiene su propio carrito
    [HttpGet("my")]
    [Authorize(Policy = "CustomerOnly")]
    public async Task<IActionResult> GetMyCart()
    {
        var result = await _cartBusiness.GetByUserId(GetUserId());

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    // POST: api/cart — Customer: crea su carrito
    [HttpPost]
    [Authorize(Policy = "CustomerOnly")]
    public async Task<IActionResult> Create()
    {
        var result = await _cartBusiness.Create(GetUserId());

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    // PUT: api/cart — Customer: actualiza su carrito
    [HttpPut]
    [Authorize(Policy = "CustomerOnly")]
    public async Task<IActionResult> Update([FromBody] CartDto dto)
    {
        var result = await _cartBusiness.Update(dto, GetUserId());

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    // PATCH: api/cart/{id}/status — Admin / Empleado
    [HttpPatch("{id}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] bool isActive)
    {
        var result = await _cartBusiness.UpdateStatus(id, isActive);

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    // DELETE: api/cart/{id} — Admin / Empleado
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _cartBusiness.Delete(id);

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }
}
