using ArteTextil.Business;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DemandController : ControllerBase
{
    private readonly DemandBusiness _business;

    public DemandController(DemandBusiness business)
    {
        _business = business;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? product)
    {
        var result = await _business.GetDemand(product);
        return Ok(result);
    }
}