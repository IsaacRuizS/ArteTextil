using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.Helpers;
using ArteTextil.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

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

            var exists = await _repositoryAlert.Query().AnyAsync(a => a.CreatedAt >= today && a.Title == "Reporte diario de alertas");

            if (!exists)
            {
                // guardar la alerta 
                var alertMessage = $@"
                    Promociones por vencer: {promotions.Count}
                    Productos con bajo stock: {products.Count}
                    Órdenes críticas: {orders.Count}

                    Detalle:

                    PROMOCIONES:
                    {string.Join("\n", promotions.Select(p => $"- {p.Name} ({p.Product?.Name}) vence: {p.EndDate:dd/MM/yyyy}"))}

                    PRODUCTOS:
                    {string.Join("\n", products.Select(p => $"- {p.Name} stock: {p.Stock} reservado: {p.QuantityReserved} mínimo: {p.MinStock}"))}

                    ÓRDENES:
                    {string.Join("\n", orders.Select(o => $"- Orden #{o.OrderId} estado: {o.Status} entrega: {o.DeliveryDate:dd/MM/yyyy}"))}
                ";

                if (promotions.Any() || products.Any() || orders.Any())
                {
                    var alert = new Alert
                    {
                        Title = "Reporte diario de alertas",
                        Message = alertMessage,
                        IsRead = false,
                        CreatedAt = DateTime.Now
                    };

                    await _repositoryAlert.AddAsync(alert);
                    await _repositoryAlert.SaveAsync();

                    await _logHelper.LogCreate("Alerts", alert.AlertId, alertMessage);
                }

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
}