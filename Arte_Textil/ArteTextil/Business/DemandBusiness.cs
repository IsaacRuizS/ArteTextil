using ArteTextil.Data;
using ArteTextil.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ArteTextil.Business;

public class DemandBusiness
{
    private readonly ArteTextilDbContext _context;

    private static readonly string[] MonthNames =
    {
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    };

    public DemandBusiness(ArteTextilDbContext context)
    {
        _context = context;
    }

    public async Task<List<DemandPredictionDto>> GetDemand(string? productFilter)
    {
        var query = _context.DemandHistory.AsQueryable();

        if (!string.IsNullOrEmpty(productFilter))
            query = query.Where(d => d.ProductName.Contains(productFilter));

        var historical = await query
            .OrderBy(d => d.ProductId)
            .ThenBy(d => d.Year)
            .ThenBy(d => d.Month)
            .ToListAsync();

        var result = historical.Select(d => new DemandPredictionDto
        {
            ProductId    = d.ProductId,
            ProductName  = d.ProductName,
            Year         = d.Year,
            MonthNumber  = d.Month,
            Month        = $"{MonthNames[d.Month - 1]} {d.Year}",
            TotalQuantity = d.TotalQuantity,
            IsForecast   = false
        }).ToList();

        // Calcular forecast para los próximos 3 meses por producto (promedio móvil de últimos 3 meses)
        var byProduct = historical
            .GroupBy(d => new { d.ProductId, d.ProductName });

        foreach (var group in byProduct)
        {
            var last3 = group
                .OrderByDescending(d => d.Year)
                .ThenByDescending(d => d.Month)
                .Take(3)
                .ToList();

            if (!last3.Any()) continue;

            var avg = (int)Math.Round(last3.Average(d => d.TotalQuantity));

            var latest = last3.First();
            var forecastYear  = latest.Year;
            var forecastMonth = latest.Month;

            for (int i = 1; i <= 3; i++)
            {
                forecastMonth++;
                if (forecastMonth > 12)
                {
                    forecastMonth = 1;
                    forecastYear++;
                }

                result.Add(new DemandPredictionDto
                {
                    ProductId     = group.Key.ProductId,
                    ProductName   = group.Key.ProductName,
                    Year          = forecastYear,
                    MonthNumber   = forecastMonth,
                    Month         = $"{MonthNames[forecastMonth - 1]} {forecastYear}",
                    TotalQuantity = avg,
                    IsForecast    = true
                });
            }
        }

        return result
            .OrderBy(d => d.ProductName)
            .ThenBy(d => d.Year)
            .ThenBy(d => d.MonthNumber)
            .ToList();
    }
}
