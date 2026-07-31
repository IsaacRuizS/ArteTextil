using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using System.Text.Json;

namespace ArteTextil.Business
{
    public class AlertBusiness
    {
        private readonly IRepositoryAlert _repositoryAlert;
        private readonly IMapper _mapper;
        private readonly ISystemLogHelper _logHelper;

        public AlertBusiness(
            ArteTextilDbContext context,
            IMapper mapper,
            ISystemLogHelper logHelper)
        {
            _repositoryAlert = new RepositoryAlert(context);
            _mapper = mapper;
            _logHelper = logHelper;
        }

        // GET ALL ACTIVE
        public async Task<ApiResponse<List<AlertDto>>> GetAllActive()
        {
            var response = new ApiResponse<List<AlertDto>>();

            try
            {
                var alerts = await _repositoryAlert.GetAllAsync(a =>
                    a.DeletedAt == null && a.IsRead == false);

                var data = _mapper.Map<List<AlertDto>>(alerts);

                foreach (var dto in data)
                {
                    ApplyPayload(dto);
                }

                response.Data = data;
                response.Message = "Alertas obtenidas correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener alertas: {ex.Message}";
            }

            return response;
        }

        // El detalle viene como JSON en Message; las alertas viejas son texto plano.
        private static void ApplyPayload(AlertDto dto)
        {
            var raw = dto.message?.TrimStart();

            if (string.IsNullOrEmpty(raw) || !raw.StartsWith('{')) return;

            try
            {
                var payload = JsonSerializer.Deserialize<AlertPayloadDto>(raw);

                if (payload == null) return;

                dto.type = payload.type;
                dto.severity = payload.severity;
                dto.detail = new AlertDetailDto
                {
                    count = payload.items.Count,
                    items = payload.items
                };

                // Se reemplaza el JSON para que no llegue a la pantalla.
                dto.message = payload.summary;
            }
            catch (JsonException)
            {
                // Un JSON malformado no debe tumbar el listado completo.
            }
        }

        // MARCAR TODAS COMO LEÍDAS
        public async Task<ApiResponse<int>> MarkAllAsRead()
        {
            var response = new ApiResponse<int>();

            try
            {
                var alerts = await _repositoryAlert.GetAllAsync(a =>
                    a.DeletedAt == null && a.IsRead == false);

                if (!alerts.Any())
                {
                    response.Data = 0;
                    response.Message = "No hay alertas pendientes";
                    return response;
                }

                foreach (var alert in alerts)
                {
                    alert.IsRead = true;
                    alert.UpdatedAt = DateTime.UtcNow;
                    _repositoryAlert.Update(alert);
                }

                await _repositoryAlert.SaveAsync();

                await _logHelper.LogUpdate(
                    tableName: "Alerts",
                    recordId: 0,
                    previousValue: $"{alerts.Count()} alertas sin leer",
                    newValue: "Todas marcadas como leídas"
                );

                response.Data = alerts.Count();
                response.Message = $"{alerts.Count()} alerta(s) marcadas como leídas";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al marcar las alertas: {ex.Message}";
            }

            return response;
        }

        // UPDATE SOLO IsRead
        public async Task<ApiResponse<bool>> UpdateIsRead(long id, bool isRead)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var alert = await _repositoryAlert
                    .FirstOrDefaultAsync(a => a.AlertId == id && a.DeletedAt == null);

                if (alert == null)
                {
                    response.Success = false;
                    response.Message = "Alerta no encontrada";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(alert);

                alert.IsRead = isRead;
                alert.UpdatedAt = DateTime.UtcNow;

                _repositoryAlert.Update(alert);
                await _repositoryAlert.SaveAsync();

                await _logHelper.LogUpdate(
                    tableName: "Alerts",
                    recordId: alert.AlertId,
                    previousValue: previousSnapshot,
                    newValue: JsonSerializer.Serialize(alert)
                );

                response.Data = true;
                response.Message = isRead
                    ? "Alerta marcada como leída"
                    : "Alerta marcada como no leída";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al actualizar alerta: {ex.Message}";
            }

            return response;
        }
    }
}