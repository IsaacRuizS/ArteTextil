using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using System.Threading.Tasks;

public class DailyAlertsJobService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public DailyAlertsJobService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var jobBusiness = scope.ServiceProvider.GetRequiredService<IJobBusiness>();

                await jobBusiness.ExecuteDailyJobs();
            }

            // Espera 24 horas
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}