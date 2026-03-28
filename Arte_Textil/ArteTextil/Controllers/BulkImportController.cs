using ArteTextil.Business;
using ArteTextil.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BulkImportController : ControllerBase
{
    private readonly BulkImportBusiness _bulkImportBusiness;

    public BulkImportController(BulkImportBusiness bulkImportBusiness)
    {
        _bulkImportBusiness = bulkImportBusiness;
    }

    [HttpPost("products")]
    public async Task<IActionResult> ImportProducts(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { data = new BulkImportResultDto(), message = "Archivo requerido." });

        using var stream = file.OpenReadStream();
        var result = await _bulkImportBusiness.ImportProducts(stream);
        return Ok(new { data = result });
    }

    [HttpPost("customers")]
    public async Task<IActionResult> ImportCustomers(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { data = new BulkImportResultDto(), message = "Archivo requerido." });

        using var stream = file.OpenReadStream();
        var result = await _bulkImportBusiness.ImportCustomers(stream);
        return Ok(new { data = result });
    }

    [HttpPost("promotions")]
    public async Task<IActionResult> ImportPromotions(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { data = new BulkImportResultDto(), message = "Archivo requerido." });

        using var stream = file.OpenReadStream();
        var result = await _bulkImportBusiness.ImportPromotions(stream);
        return Ok(new { data = result });
    }

    [HttpPost("users")]
    public async Task<IActionResult> ImportUsers(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { data = new BulkImportResultDto(), message = "Archivo requerido." });

        using var stream = file.OpenReadStream();
        var result = await _bulkImportBusiness.ImportUsers(stream);
        return Ok(new { data = result });
    }
}
