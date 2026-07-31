using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using ArteTextil.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

public class JobBusiness : IJobBusiness
{
    private readonly IRepositoryPromotion _repositoryPromotion;
    private readonly IRepositoryProduct _repositoryProduct;
    private readonly IRepositoryOrder _repositoryOrder;
    private readonly IRepositoryCustomer _repositoryCustomer;
    private readonly IRepositoryUser _repositoryUser;
    private readonly IRepositoryAlert _repositoryAlert;
    private readonly IEmailService _emailService;
    private readonly IMapper _mapper;
    private readonly ISystemLogHelper _logHelper;

    public JobBusiness(
        ArteTextilDbContext context,
        IMapper mapper,
        ISystemLogHelper logHelper,
        IEmailService emailService)
    {
        _repositoryPromotion = new RepositoryPromotion(context);
        _repositoryProduct = new RepositoryProduct(context);
        _repositoryOrder = new RepositoryOrder(context);
        _repositoryCustomer = new RepositoryCustomer(context);
        _repositoryUser = new RepositoryUser(context);
        _repositoryAlert = new RepositoryAlert(context);
        _emailService = emailService;
        _mapper = mapper;
        _logHelper = logHelper;
    }

    public async Task ExecuteDailyJobs()
    {
        try
        {
            var now = DateTime.Now;
            var next24h = now.AddHours(24);

            //alerta de promociones prontas a vencer 
            var promotions = await _repositoryPromotion.Query()
                .Include(p => p.Product)
                .Where(p => p.DeletedAt == null 
                    && p.IsActive
                    && p.EndDate >= now
                    && p.EndDate <= next24h)
                .ToListAsync();

            //Alertar productos cerca a agotar existencias
            var products = await _repositoryProduct.Query()
            .Where(p => p.IsActive
                && p.DeletedAt == null
                && (p.Stock - p.QuantityReserved) <= p.MinStock)
            .ToListAsync();


            //Alerta de ordenes cerca del deliverDate
            var orders = await _repositoryOrder.Query()
                .Include(x => x.OrderItems)
                .Where(o => o.IsActive
                    && o.DeletedAt == null
                    && o.Status != "Cancelado"
                    && o.Status != "Entregado"
                    && (
                        (o.DeliveryDate >= now && o.DeliveryDate <= next24h)
                        || o.DeliveryDate < now
                    )
                )
                .ToListAsync();

            //obtener la lista de customers a los que enviar el correo
            var customerEmails = await _repositoryCustomer.Query()
                .Where(c => c.IsActive
                    && c.DeletedAt == null
                    && c.UserId != null
                    && !string.IsNullOrEmpty(c.Email)
                    && !string.IsNullOrEmpty(c.FullName)
                    && !string.IsNullOrEmpty(c.Phone))
                .Select(c => c.Email)
                .Distinct()
                .ToListAsync();

            //Obtener la lista de empleados a los que enviar el correo
            var adminEmails = await _repositoryUser.Query()
                .Where(u => u.IsActive
                    && u.DeletedAt == null
                    && (u.RoleId == 1 || u.RoleId == 4)
                    && !string.IsNullOrEmpty(u.Email))
                .Select(u => u.Email)
                .Distinct()
                .ToListAsync();


            var today = DateTime.Today;

            var exists = await _repositoryAlert.Query().AnyAsync(a => a.CreatedAt >= today);

            if (!exists)
            {
                // Una alerta por tema, para poder priorizarlas y marcarlas aparte.
                await CreateStockAlert(products);
                await CreateOrdersAlert(orders, now);
                await CreatePromotionsAlert(promotions);

                //enviar correo de promociones para customers
                if (customerEmails.Any())
                {
                    await _emailService.SendPromotionsExpiringAsync(customerEmails!, promotions);
                }

                //enviar correos a gerentes y admins
                if (adminEmails.Any())
                {
                    await _emailService.SendDailyAlertsToAdminsAsync(adminEmails, promotions, products, orders);
                }
                
            } 
        }
        catch (Exception ex)
        {

            var safeMessage = ex.Message.Length > 1000
            ? ex.Message.Substring(0, 1000)
            : ex.Message;

            await _logHelper.LogCreate("Alerts - Error", 0, $"Error en JobBusiness: {safeMessage}");
        }
    }

    // ── Construcción de alertas por tema ─────────────────────────────────────

    private async Task CreateStockAlert(List<Product> products)
    {
        if (!products.Any()) return;

        var items = products
            .Select(p => new AlertItemDto
            {
                entityId = p.ProductId,
                label = p.Name,
                detail = $"Disponible {p.Stock - p.QuantityReserved} · stock {p.Stock} · reservado {p.QuantityReserved} · mínimo {p.MinStock}",
                critical = (p.Stock - p.QuantityReserved) <= 0
            })
            // Lo más grave primero.
            .OrderByDescending(i => i.critical)
            .ThenBy(i => i.label)
            .ToList();

        var sinStock = items.Count(i => i.critical);

        await SaveAlert(
            type: "Stock",
            severity: sinStock > 0 ? "Alta" : "Media",
            title: products.Count == 1
                ? "1 producto con stock bajo"
                : $"{products.Count} productos con stock bajo",
            summary: sinStock > 0
                ? $"{sinStock} sin disponibilidad y {products.Count - sinStock} por debajo del mínimo."
                : "Están por debajo del stock mínimo definido.",
            items: items
        );
    }

    private async Task CreateOrdersAlert(List<Order> orders, DateTime now)
    {
        if (!orders.Any()) return;

        var items = orders
            .Select(o => new AlertItemDto
            {
                entityId = o.OrderId,
                label = $"Orden #{o.OrderId}",
                detail = o.DeliveryDate < now
                    ? $"Vencida desde el {o.DeliveryDate:dd/MM/yyyy} · estado {o.Status}"
                    : $"Entrega {o.DeliveryDate:dd/MM/yyyy} · estado {o.Status}",
                critical = o.DeliveryDate < now
            })
            .OrderByDescending(i => i.critical)
            .ThenBy(i => i.label)
            .ToList();

        var vencidas = items.Count(i => i.critical);

        await SaveAlert(
            type: "Orden",
            severity: vencidas > 0 ? "Alta" : "Media",
            title: orders.Count == 1
                ? "1 orden requiere atención"
                : $"{orders.Count} órdenes requieren atención",
            summary: vencidas > 0
                ? $"{vencidas} con la fecha de entrega vencida."
                : "Con entrega dentro de las próximas 24 horas.",
            items: items
        );
    }

    private async Task CreatePromotionsAlert(List<Promotion> promotions)
    {
        if (!promotions.Any()) return;

        var items = promotions
            .Select(p => new AlertItemDto
            {
                entityId = p.PromotionId,
                label = p.Name,
                detail = $"{p.Product?.Name} · vence {p.EndDate:dd/MM/yyyy}",
                critical = false
            })
            .OrderBy(i => i.label)
            .ToList();

        await SaveAlert(
            type: "Promocion",
            severity: "Baja",
            title: promotions.Count == 1
                ? "1 promoción por vencer"
                : $"{promotions.Count} promociones por vencer",
            summary: "Vencen dentro de las próximas 24 horas.",
            items: items
        );
    }

    private async Task SaveAlert(
        string type,
        string severity,
        string title,
        string summary,
        List<AlertItemDto> items)
    {
        // El detalle va serializado en Message: no hace falta cambiar el esquema.
        var payload = new AlertPayloadDto
        {
            type = type,
            severity = severity,
            summary = summary,
            items = items
        };

        var alert = new Alert
        {
            Title = title,
            Message = JsonSerializer.Serialize(payload, JsonOptions),
            IsRead = false,
            CreatedAt = DateTime.Now
        };

        await _repositoryAlert.AddAsync(alert);
        await _repositoryAlert.SaveAsync();

        // El log guarda la versión legible, no el JSON.
        var readable = $"{summary}\n" + string.Join("\n", items.Select(i => $"- {i.label}: {i.detail}"));

        await _logHelper.LogCreate("Alerts", alert.AlertId, readable);
    }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        // Sin escapar acentos, para poder leer el registro en la base.
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };
}