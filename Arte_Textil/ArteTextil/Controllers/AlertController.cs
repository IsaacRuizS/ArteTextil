using ArteTextil.Business;
using ArteTextil.Helpers;
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
        private readonly IJobBusiness _jobBusiness;

        public AlertController(AlertBusiness alertBusiness, IJobBusiness jobBusiness)
        {
            _alertBusiness = alertBusiness;
            _jobBusiness = jobBusiness;
        }

        // POST: api/alert/generate?force=true
        // Genera las alertas del día bajo demanda. NO envía correos: es solo
        // para revisar en pantalla sin esperar al job de las 24 horas.
        [Authorize(Policy = "AdminOnly")]
        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromQuery] bool force = false)
        {
            try
            {
                var created = await _jobBusiness.GenerateAlertsNow(force);

                return Ok(new ApiResponse<int>
                {
                    Data = created,
                    Message = created == 0
                        ? force
                            ? "No hay promociones por vencer, productos con stock bajo ni órdenes críticas."
                            : "Ya se generaron las alertas de hoy. Use force=true para volver a generarlas."
                        : $"{created} alerta(s) generada(s)."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<int>
                {
                    Success = false,
                    Message = $"Error al generar las alertas: {ex.Message}"
                });
            }
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

        // PATCH: api/alert/read-all
        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var result = await _alertBusiness.MarkAllAsRead();

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