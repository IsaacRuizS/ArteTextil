using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Helpers;
using Microsoft.EntityFrameworkCore;

namespace ArteTextil.Business;

public class ReportsBusiness
{
    private readonly ArteTextilDbContext _context;

    public ReportsBusiness(ArteTextilDbContext context)
    {
        _context = context;
    }

    // #78 — Inventory report: rotation, consumption and stock level
    public async Task<ApiResponse<List<InventoryReportView>>> GetInventoryReport(string? stockLevel)
    {
        try
        {
            var query = _context.InventoryReport.AsQueryable();

            if (!string.IsNullOrEmpty(stockLevel))
                query = query.Where(r => r.StockLevel == stockLevel);

            var data = await query
                .OrderBy(r => r.Category)
                .ThenBy(r => r.ProductName)
                .ToListAsync();

            return new ApiResponse<List<InventoryReportView>>
            {
                Success = true,
                Message = "Inventory report retrieved successfully.",
                Data    = data
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<InventoryReportView>>
            {
                Success = false,
                Message = $"Error retrieving inventory report: {ex.Message}"
            };
        }
    }

    // #76 — Sales report by product, customer or period
    public async Task<ApiResponse<List<SalesReportView>>> GetSalesReport(
        DateTime? startDate, DateTime? endDate, int? customerId, int? productId)
    {
        try
        {
            var query = _context.SalesReport.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(r => r.OrderDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(r => r.OrderDate <= endDate.Value.AddDays(1).AddTicks(-1));

            if (customerId.HasValue)
                query = query.Where(r => r.CustomerId == customerId.Value);

            if (productId.HasValue)
                query = query.Where(r => r.ProductId == productId.Value);

            var data = await query
                .OrderByDescending(r => r.OrderDate)
                .ToListAsync();

            return new ApiResponse<List<SalesReportView>>
            {
                Success = true,
                Message = "Sales report retrieved successfully.",
                Data    = data
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<SalesReportView>>
            {
                Success = false,
                Message = $"Error retrieving sales report: {ex.Message}"
            };
        }
    }

    // #70 — Completed orders report by period or product type
    public async Task<ApiResponse<List<CompletedOrdersReportView>>> GetCompletedOrdersReport(
        DateTime? startDate, DateTime? endDate, int? categoryId)
    {
        try
        {
            var query = _context.CompletedOrdersReport.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(r => r.OrderDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(r => r.OrderDate <= endDate.Value.AddDays(1).AddTicks(-1));

            if (categoryId.HasValue)
                query = query.Where(r => r.CategoryId == categoryId.Value);

            var data = await query
                .OrderByDescending(r => r.OrderDate)
                .ToListAsync();

            return new ApiResponse<List<CompletedOrdersReportView>>
            {
                Success = true,
                Message = "Completed orders report retrieved successfully.",
                Data    = data
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<CompletedOrdersReportView>>
            {
                Success = false,
                Message = $"Error retrieving completed orders report: {ex.Message}"
            };
        }
    }
}
