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

                response.Data = _mapper.Map<List<AlertDto>>(alerts);
                response.Message = "Alertas obtenidas correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener alertas: {ex.Message}";
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