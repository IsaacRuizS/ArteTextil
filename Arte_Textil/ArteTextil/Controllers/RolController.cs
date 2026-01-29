using ArteTextil.Business;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolController : ControllerBase
    {
        private readonly RolBusiness _rolBusiness;

        public RolController(RolBusiness rolBusiness)
        {
            _rolBusiness = rolBusiness;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _rolBusiness.GetAll();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }
    }
}
