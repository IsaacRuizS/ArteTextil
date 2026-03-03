using ArteTextil.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArteTextil.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AlertController : ControllerBase
{
    private readonly ArteTextilDbContext _context;

    public AlertController(ArteTextilDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var alerts = await _context.Alerts
            .Where(a => a.DeletedAt == null)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(alerts);
    }
}
