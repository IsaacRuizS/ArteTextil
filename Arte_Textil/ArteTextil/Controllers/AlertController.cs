using ArteTextil.Business;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArteTextil.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AlertController : ControllerBase
    {
        private readonly AlertBusiness _alertBusiness;

        public AlertController(AlertBusiness alertBusiness)
        {
            _alertBusiness = alertBusiness;
        }

        // GET: api/alert/all-active
        [HttpGet("all-active")]
        public async Task<IActionResult> GetAllActive()
        {
            var result = await _alertBusiness.GetAllActive();

            if (!result.Success)
                return StatusCode(500, result);

            return Ok(result);
        }

        // PATCH: api/alert/{id}/read
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> UpdateIsRead(long id, [FromBody] bool isRead)
        {
            var result = await _alertBusiness.UpdateIsRead(id, isRead);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}