using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SaludoController : ControllerBase
    {
        [HttpGet("hola")]
        public IActionResult ObtenerSaludo()
        {
            return Ok("¡Hola desde el backend de ArteTextil!");
        }
    }
}
