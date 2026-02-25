using ArteTextil.Data;
using ArteTextil.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ArteTextil.Business;

public class DemandBusiness
{
    private readonly ArteTextilDbContext _context;

    public DemandBusiness(ArteTextilDbContext context)
    {
        _context = context;
    }

    public async Task<List<DemandPredictionDto>> GetDemand(string? productFilter)
    {
        var query = _context.QuoteItems
            .Include(q => q.Quote)
            .Include(q => q.Product)
            .Where(q =>
                q.IsActive &&
                q.Quote != null &&
                q.Quote.IsActive &&
                q.Quote.DeletedAt == null
            );

        if (!string.IsNullOrEmpty(productFilter))
        {
            query = query.Where(q =>
                q.Product!.Name.Contains(productFilter));
        }

        var result = await query
            .GroupBy(q => new
            {
                q.ProductId,
                q.Product!.Name,
                Month = q.Quote!.CreatedAt.Month
            })
            .Select(g => new DemandPredictionDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                Month = $"Mes {g.Key.Month}",
                TotalQuantity = g.Sum(x => x.Quantity)
            })
            .OrderBy(x => x.ProductName)
            .ToListAsync();

        return result;
    }
}
