public interface IJobBusiness
{
    Task ExecuteDailyJobs();

    // Disparo manual: genera las alertas sin enviar correos.
    Task<int> GenerateAlertsNow(bool force);
}