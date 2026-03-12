using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Net.NetworkInformation;
using System.Text.Json;

namespace ArteTextil.Business
{
    public class OrderBusiness
    {
        private readonly IRepositoryOrder _repositoryOrder;
        private readonly IRepositoryOrderItem _repositoryOrderItem;
        private readonly IRepositoryOrderStatusHistory _repositoryOrderStatusHistory;
        private readonly IRepositoryProduct _repositoryProduct;
        private readonly IRepositoryQuote _repositoryQuote;
        private readonly IRepositoryCustomer _repositoryCustomer;
        private readonly ArteTextilDbContext _context;
        private readonly IMapper _mapper;
        private readonly ISystemLogHelper _logHelper;

        public OrderBusiness(
            ArteTextilDbContext context,
            IMapper mapper,
            ISystemLogHelper logHelper)
        {
            _context = context;
            _repositoryOrder = new RepositoryOrder(context);
            _repositoryOrderItem = new RepositoryOrderItem(context);
            _repositoryOrderStatusHistory = new RepositoryOrderStatusHistory(context);
            _repositoryProduct = new RepositoryProduct(context);
            _repositoryQuote = new RepositoryQuote(context);
            _repositoryCustomer = new RepositoryCustomer(context);

            _mapper = mapper;
            _logHelper = logHelper;
        }
        
        //GET ALL

        public async Task<ApiResponse<List<OrderDto>>> GetAll()
        {
            var response = new ApiResponse<List<OrderDto>>();

            try
            {
                var orders = await _repositoryOrder.Query()
                    .Include(o => o.OrderItems)
                    .Include(o => o.OrderStatusHistory)
                    .Include(o => o.Customer)
                    .Include(o => o.Quote).ThenInclude(q => q.QuoteItems)
                    .Where(o => o.DeletedAt == null)
                    .ToListAsync();

                var productIds = orders
                    .Where(o => o.Quote?.QuoteItems != null)
                    .SelectMany(o => o.Quote!.QuoteItems!)
                    .Select(qi => qi.ProductId)
                    .Distinct()
                    .ToList();

                var products = await _repositoryProduct.Query()
                    .Where(p => productIds.Contains(p.ProductId) && p.DeletedAt == null)
                    .Select(p => new { p.ProductId, p.Name })
                    .ToListAsync();

                var productDictionary = products.ToDictionary(p => p.ProductId, p => p.Name);

                var ordersDto = _mapper.Map<List<OrderDto>>(orders);

                foreach (var order in ordersDto)
                {
                    order.quote?.items?.ForEach(qi =>
                    {
                        if (productDictionary.TryGetValue(qi.productId, out var name))
                        {
                            qi.productName = name;
                        }
                    });
                }


                response.Data = ordersDto;
                response.Message = "Órdenes obtenidas correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener órdenes: {ex.Message}";
            }

            return response;
        }

        //GET BY ID
        public async Task<ApiResponse<OrderDto>> GetById(int id)
        {
            var response = new ApiResponse<OrderDto>();

            try
            {
                var order = await _repositoryOrder.Query()
                    .Include(o => o.OrderItems)
                    .Include(o => o.OrderStatusHistory)
                    .FirstOrDefaultAsync(o => o.OrderId == id && o.DeletedAt == null);

                if (order == null)
                {
                    response.Success = false;
                    response.Message = "Orden no encontrada";
                    return response;
                }

                response.Data = _mapper.Map<OrderDto>(order);
                response.Message = "Orden obtenida correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener orden: {ex.Message}";
            }

            return response;
        }

        //CREATE (Order + StatusHistory)
        public async Task<ApiResponse<OrderDto>> Create(OrderDto dto)
        {
            var response = new ApiResponse<OrderDto>();

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // VALIDACIONES BÁSICAS

                if (dto.deliveryDate == null)
                {
                    response.Success = false;
                    response.Message = "La fecha de entrega es obligatoria.";
                    return response;
                }

                Order order;

                
                // CASO 1: CREAR ORDEN DESDE COTIZACIÓN EXISTENTE
                
                if (dto.quoteId > 0)
                {
                    var quote = await _repositoryQuote.Query()
                        .Include(q => q.QuoteItems)
                        .FirstOrDefaultAsync(q =>
                            q.QuoteId == dto.quoteId &&
                            q.DeletedAt == null &&
                            q.IsActive);

                    if (quote == null)
                    {
                        response.Success = false;
                        response.Message = "La cotización no existe o está inactiva.";
                        return response;
                    }

                    if (quote.Status == "Pedido Realizado")
                    {
                        response.Success = false;
                        response.Message = "La cotización ya fue convertida en una orden.";
                        return response;
                    }

                    // Crear Order
                    order = new Order
                    {
                        CustomerId = quote.CustomerId,
                        QuoteId = quote.QuoteId,
                        DeliveryDate = dto.deliveryDate,
                        Status = dto.status ?? "Nuevo",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _repositoryOrder.AddAsync(order);
                    await _repositoryOrder.SaveAsync();

                    // Copiar Items
                    foreach (var qi in quote.QuoteItems)
                    {
                        var orderItem = new OrderItem
                        {
                            OrderId = order.OrderId,
                            ProductId = qi.ProductId,
                            Quantity = qi.Quantity,
                            Price = qi.Price,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };

                        await _repositoryOrderItem.AddAsync(orderItem);

                        // OPCIONAL: Descontar stock aquí
                        var product = await _repositoryProduct.GetByIdAsync(qi.ProductId);
                        if (product != null)
                        {
                            product.Stock -= qi.Quantity;
                            _repositoryProduct.Update(product);
                        }
                    }

                    await _repositoryOrderItem.SaveAsync();

                    // Cambiar estado Quote
                    quote.Status = "Pedido Realizado";
                    quote.UpdatedAt = DateTime.UtcNow;
                    _repositoryQuote.Update(quote);
                }
                
                // CASO 2: CREAR ORDEN NORMAL (SIN QUOTE)
                
                else
                {
                    if (dto.customerId == 0)
                    {
                        response.Success = false;
                        response.Message = "Debe indicar el cliente.";
                        return response;
                    }

                    order = new Order
                    {
                        CustomerId = dto.customerId,
                        DeliveryDate = dto.deliveryDate,
                        Status = dto.status ?? "Nuevo",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _repositoryOrder.AddAsync(order);
                    await _repositoryOrder.SaveAsync();

                    if (dto.items != null && dto.items.Any())
                    {
                        foreach (var item in dto.items)
                        {
                            var orderItem = new OrderItem
                            {
                                OrderId = order.OrderId,
                                ProductId = item.productId,
                                Quantity = item.quantity,
                                Price = item.price,
                                IsActive = true,
                                CreatedAt = DateTime.UtcNow
                            };

                            await _repositoryOrderItem.AddAsync(orderItem);
                        }

                        await _repositoryOrderItem.SaveAsync();
                    }
                }

                var history = new OrderStatusHistory
                {
                    OrderId = order.OrderId,
                    Status = order.Status,
                    PerformedByUserId = dto.performByUserId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _repositoryOrderStatusHistory.AddAsync(history);
                await _repositoryOrderStatusHistory.SaveAsync();

                // LOG
                var logObject = new
                {
                    order.OrderId,
                    order.CustomerId,
                    order.QuoteId,
                    order.Status,
                    order.DeliveryDate
                };

                await _logHelper.LogCreate(
                    tableName: "Orders",
                    recordId: order.OrderId,
                    newValue: JsonSerializer.Serialize(logObject)
                );

                await transaction.CommitAsync();

                response.Data = dto;
                response.Message = "Orden creada correctamente";
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                response.Success = false;
                response.Message = $"Error al crear orden: {ex.Message}";
            }

            return response;
        }

        //UPDATE (si cambia status → crea historial)
        public async Task<ApiResponse<OrderDto>> Update(int id, OrderDto dto)
        {
            var response = new ApiResponse<OrderDto>();

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _repositoryOrder
                    .FirstOrDefaultAsync(o => o.OrderId == id && o.DeletedAt == null);

                if (order == null)
                {
                    response.Success = false;
                    response.Message = "Orden no encontrada";
                    return response;
                }

                // Snapshot previo para log (evita ciclos)
                var previousSnapshot = JsonSerializer.Serialize(new
                {
                    order.OrderId,
                    order.CustomerId,
                    order.QuoteId,
                    order.Status,
                    order.DeliveryDate,
                    order.IsActive,
                    order.Notes
                });

                var statusChanged = order.Status != dto.status;

                order.Status = dto.status;
                order.DeliveryDate = dto.deliveryDate;
                order.Notes = dto.notes;
                order.IsActive = dto.isActive;
                order.UpdatedAt = DateTime.UtcNow;

                _repositoryOrder.Update(order);
                await _repositoryOrder.SaveAsync();

                // Crear historial si el estado cambió
                if (statusChanged)
                {
                    var history = new OrderStatusHistory
                    {
                        OrderId = order.OrderId,
                        Status = order.Status,
                        IsActive = true,
                        PerformedByUserId = dto.performByUserId,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _repositoryOrderStatusHistory.AddAsync(history);
                    await _repositoryOrderStatusHistory.SaveAsync();

                    if(dto.status == "Entregado" || dto.status == "Cancelado")
                    {
                        var quote = await _repositoryQuote.Query().FirstOrDefaultAsync(q => q.QuoteId == dto.quoteId && q.DeletedAt == null);
                        if(quote != null)
                        {
                            quote.Status = dto.status;
                            _repositoryQuote.Update(quote);
                        }
                    }
                }

                // Snapshot nuevo para log
                var newSnapshot = JsonSerializer.Serialize(new
                {
                    order.OrderId,
                    order.CustomerId,
                    order.QuoteId,
                    order.Status,
                    order.DeliveryDate,
                    order.IsActive,
                    order.Notes
                });

                await _logHelper.LogUpdate(
                    tableName: "Orders",
                    recordId: order.OrderId,
                    previousValue: previousSnapshot,
                    newValue: newSnapshot
                );

                await transaction.CommitAsync();

                response.Data = _mapper.Map<OrderDto>(order);
                response.Message = "Orden actualizada correctamente";
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                response.Success = false;
                response.Message = $"Error al actualizar orden: {ex.Message}";
            }

            return response;
        }

        // ACTUALIZAR ESTADO (ACTIVO / INACTIVO)
        public async Task<ApiResponse<bool>> UpdateIsActive(int id, bool isActive)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var order = await _repositoryOrder
                    .FirstOrDefaultAsync(o => o.OrderId == id);

                if (order == null)
                {
                    response.Success = false;
                    response.Message = "Orden no encontrada";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(order);

                order.IsActive = isActive;
                order.UpdatedAt = DateTime.UtcNow;

                _repositoryOrder.Update(order);
                await _repositoryOrder.SaveAsync();

                await _logHelper.LogUpdate(
                    tableName: "Orders",
                    recordId: order.OrderId,
                    previousValue: previousSnapshot,
                    newValue: JsonSerializer.Serialize(order)
                );

                response.Data = true;
                response.Message = isActive
                    ? "Orden activada correctamente"
                    : "Orden desactivada correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al actualizar estado de la orden: {ex.Message}";
            }

            return response;
        }

        
        //UPDATE STATUS DIRECTO
        public async Task<ApiResponse<bool>> ChangeStatus(int id, string newStatus)
        {
            var response = new ApiResponse<bool>();

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _repositoryOrder
                    .FirstOrDefaultAsync(o => o.OrderId == id && o.DeletedAt == null);

                if (order == null)
                {
                    response.Success = false;
                    response.Message = "Orden no encontrada";
                    return response;
                }

                var previousSnapshot = JsonSerializer.Serialize(order);

                order.Status = newStatus;
                order.UpdatedAt = DateTime.UtcNow;

                _repositoryOrder.Update(order);
                await _repositoryOrder.SaveAsync();

                var history = new OrderStatusHistory
                {
                    OrderId = order.OrderId,
                    Status = newStatus,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _repositoryOrderStatusHistory.AddAsync(history);
                await _repositoryOrderStatusHistory.SaveAsync();

                await _logHelper.LogUpdate(
                    tableName: "Orders",
                    recordId: order.OrderId,
                    previousValue: previousSnapshot,
                    newValue: JsonSerializer.Serialize(order)
                );

                await transaction.CommitAsync();

                response.Data = true;
                response.Message = "Estado actualizado correctamente";
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                response.Success = false;
                response.Message = $"Error al cambiar estado: {ex.Message}";
            }

            return response;
        }

        // GET STATUS HISTORY BY ORDER
        public async Task<ApiResponse<List<OrderStatusHistory>>> GetOrderStatusHistory(int orderId)
        {
            var response = new ApiResponse<List<OrderStatusHistory>>();

            try
            {
                var history = await _repositoryOrderStatusHistory.Query()
                    .Where(h => h.OrderId == orderId && h.DeletedAt == null)
                    .OrderByDescending(h => h.CreatedAt)
                    .ToListAsync();

                response.Data = history;
                response.Message = "Historial de estados obtenido correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener historial: {ex.Message}";
            }

            return response;
        }
    }
}