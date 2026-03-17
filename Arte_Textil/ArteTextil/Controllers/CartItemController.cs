using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CartItemController : ControllerBase
{
    private readonly CartItemBusiness _cartItemBusiness;

    public CartItemController(CartItemBusiness cartItemBusiness)
    {
        _cartItemBusiness = cartItemBusiness;
    }

    private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);

    // GET: api/cartitem/all — Admin
    [HttpGet("all")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _cartItemBusiness.GetAll();

        if (!result.Success)
            return StatusCode(500, result);

        return Ok(result);
    }

    // GET: api/cartitem/{id} — Admin
    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _cartItemBusiness.GetById(id);

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    // GET: api/cartitem/my — Customer: items de su carrito activo
    [HttpGet("my")]
    [Authorize(Policy = "CustomerOnly")]
    public async Task<IActionResult> GetMyItems()
    {
        var result = await _cartItemBusiness.GetMyItems(GetUserId());

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    // POST: api/cartitem — Customer: agrega item a su carrito
    [HttpPost]
    [Authorize(Policy = "CustomerOnly")]
    public async Task<IActionResult> AddItem([FromBody] CartItemDto dto)
    {
        var result = await _cartItemBusiness.AddItem(dto, GetUserId());

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    // PUT: api/cartitem — Customer: actualiza cantidad
    [HttpPut]
    [Authorize(Policy = "CustomerOnly")]
    public async Task<IActionResult> UpdateQuantity([FromBody] CartItemDto dto)
    {
        var result = await _cartItemBusiness.UpdateQuantity(dto, GetUserId());

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    // PATCH: api/cartitem/{id}/status — Admin
    [HttpPatch("{id}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] bool isActive)
    {
        var result = await _cartItemBusiness.UpdateStatus(id, isActive);

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    // DELETE: api/cartitem/{id}/remove — Customer: elimina item de su carrito
    [HttpDelete("{id}/remove")]
    [Authorize(Policy = "CustomerOnly")]
    public async Task<IActionResult> RemoveItem(int id)
    {
        var result = await _cartItemBusiness.RemoveItem(id, GetUserId());

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    // DELETE: api/cartitem/{id} — Admin: soft delete
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _cartItemBusiness.Delete(id);

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }
}
