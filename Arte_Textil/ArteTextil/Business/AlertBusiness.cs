using ArteTextil.Data;
using ArteTextil.Data.Entities;
using Hangfire;
using Microsoft.EntityFrameworkCore;

namespace ArteTextil.Business;

public class AlertBusiness
{
    private readonly ArteTextilDbContext _context;

    public AlertBusiness(ArteTextilDbContext context)
    {
        _context = context;
    }

    public async Task CheckMassiveQuotes()
    {
        var today = DateTime.UtcNow.Date;

        var massive = await _context.QuoteItems
            .Include(q => q.Quote)
            .Include(q => q.Product)
            .Where(q =>
                q.Quote != null &&
                q.Quote.CreatedAt.Date == today)
            .GroupBy(q => new { q.ProductId, q.Product!.Name })
            .Select(g => new
            {
                g.Key.Name,
                Total = g.Sum(x => x.Quantity)
            })
            .Where(x => x.Total > 20)
            .ToListAsync();

        foreach (var item in massive)
        {
            var alert = new Alert
            {
                Title = "Alta Demanda Detectada",
                Message = $"El producto {item.Name} tiene {item.Total} unidades cotizadas hoy.",
                CreatedAt = DateTime.UtcNow
            };

            _context.Alerts.Add(alert);
        }

        await _context.SaveChangesAsync();
    }
}
