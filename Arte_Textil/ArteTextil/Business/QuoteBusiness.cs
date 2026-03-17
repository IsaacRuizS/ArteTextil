using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using ArteTextil.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text.Json;

namespace ArteTextil.Business;

public class QuoteBusiness
{
    private readonly ArteTextilDbContext _context;
    private readonly IRepositoryQuote _repositoryQuote;
    private readonly IRepositoryQuoteItem _repositoryQuoteItem;
    private readonly IRepositoryCustomer _repositoryCustomer;
    private readonly IRepositoryUser _repositoryUser;
    private readonly IMapper _mapper;
    private readonly ISystemLogHelper _logHelper;
    private readonly IEmailService _emailService;
    private readonly QuoteRandomNumber _quoteRandomNumber;

    public QuoteBusiness(
        ArteTextilDbContext context,
        IMapper mapper,
        ISystemLogHelper logHelper,
        IEmailService emailService,
        QuoteRandomNumber quoteRandomNumber
        )
    {
        _context = context;
        _repositoryQuote = new RepositoryQuote(context);
        _repositoryQuoteItem = new RepositoryQuoteItem(context);
        _repositoryCustomer = new RepositoryCustomer(context);
        _repositoryUser = new RepositoryUser(context);
        _mapper = mapper;
        _logHelper = logHelper;
        _emailService = emailService;
        _quoteRandomNumber = quoteRandomNumber;
    }

    // GET ALL
    public async Task<ApiResponse<List<QuoteDto>>> GetAll()
    {
        var response = new ApiResponse<List<QuoteDto>>();

        try
        {
            var quotes = await _repositoryQuote.Query()
                .Where(q => q.DeletedAt == null)
                .Include(q => q.QuoteItems)
                .Include(q => q.Customer)
                .Include(q => q.CreatedByUser)
                .ToListAsync();

            response.Data = _mapper.Map<List<QuoteDto>>(quotes);
            response.Message = "Cotizaciones obtenidas correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al obtener cotizaciones: {ex.Message}";
        }

        return response;
    }

    // GET BY ID
    public async Task<ApiResponse<QuoteDto>> GetById(int id)
    {
        var response = new ApiResponse<QuoteDto>();

        try
        {
            var quote = await _repositoryQuote.Query()
                .Include(q => q.QuoteItems)
                .FirstOrDefaultAsync(q => q.QuoteId == id && q.DeletedAt == null);

            if (quote == null)
            {
                response.Success = false;
                response.Message = "Cotización no encontrada";
                return response;
            }

            response.Data = _mapper.Map<QuoteDto>(quote);
            response.Message = "Cotización obtenida correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al obtener cotización: {ex.Message}";
        }

        return response;
    }

    // CREATE
    public async Task<ApiResponse<QuoteDto>> Create(QuoteDto dto)
    {
        var response = new ApiResponse<QuoteDto>();

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            if (dto.items == null || !dto.items.Any())
            {
                response.Success = false;
                response.Message = "La cotización debe tener productos.";
                return response;
            }

            //RESOLVER CUSTOMER AUTOMÁTICAMENTE
            
            if (dto.customerId == 0 && dto.customer != null)
            {
                var existingCustomer = await _repositoryCustomer
                    .FirstOrDefaultAsync(c =>
                        c.Email == dto.customer.email &&
                        c.DeletedAt == null);

                if (existingCustomer != null)
                {
                    // Ya existe → usar ese Id
                    dto.customerId = existingCustomer.CustomerId;

                    existingCustomer.LastQuoteDate = DateTime.UtcNow;
                    existingCustomer.ActivityScore =
                        (existingCustomer.ActivityScore ?? 0) + 1;

                    _repositoryCustomer.Update(existingCustomer);
                }
                else
                {

                    //Validar si un usuario con ese correo ya existe y si no crearlo
                    var existingUser = await _repositoryUser.FirstOrDefaultAsync(u => u.Email == dto.customer.email && u.DeletedAt == null);

                    User user;

                    if (existingUser != null)
                    {
                        user = existingUser;
                    }
                    else
                    {
                        user = new User
                        {
                            FullName = dto.customer.fullName,
                            Email = dto.customer.email ?? "",
                            Phone = dto.customer.phone ?? "",
                            PasswordHash = "",
                            RoleId = 3,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };

                        await _repositoryUser.AddAsync(user);
                        await _repositoryUser.SaveAsync();
                    }


                    // No existe → crear nuevo cliente
                    var newCustomer = new Customer
                    {
                        UserId = user.UserId,
                        FullName = dto.customer.fullName,
                        Email = dto.customer.email,
                        Phone = dto.customer.phone,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _repositoryCustomer.AddAsync(newCustomer);
                    await _repositoryCustomer.SaveAsync();

                    dto.customerId = newCustomer.CustomerId;
                }
            }

            if (dto.customerId == 0)
            {
                response.Success = false;
                response.Message = "No se pudo determinar el cliente.";
                return response;
            }

            //CREAR QUOTE

            var quoteNumber = await _quoteRandomNumber.GenerateUniqueQuoteNumber();

            var quote = new Quote
            {
                QuoteNumber = quoteNumber,
                CustomerId = dto.customerId,
                Status = dto.status ?? "Pendiente",
                Total = dto.total, 
                Notes = dto.notes,
                CreatedByUserId = dto.createdByUserId > 0 ? dto.createdByUserId : null,
                SentToEmail = dto.sentToEmail,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _repositoryQuote.AddAsync(quote);
            await _repositoryQuote.SaveAsync();

            // CREAR ITEMS
            
            foreach (var item in dto.items)
            {
                var quoteItem = new QuoteItem
                {
                    QuoteId = quote.QuoteId,
                    ProductId = item.productId,
                    Quantity = item.quantity,
                    Price = item.price,
                    DiscountAmount = item.discountAmount,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _repositoryQuoteItem.AddAsync(quoteItem);
            }

            await _repositoryQuoteItem.SaveAsync();

                // TRAER COMPLETO
            
            var created = await _repositoryQuote.Query()
                .Include(q => q.QuoteItems)
                .FirstAsync(q => q.QuoteId == quote.QuoteId);

            // LOG

            var logObject = new
            {
                quote.QuoteId,
                quote.CustomerId,
                quote.Total,
                quote.Status,
                Items = created.QuoteItems?.Select(i => new
                {
                    i.QuoteItemId,
                    i.ProductId,
                    i.Quantity,
                    i.Price
                })
            };

            await _logHelper.LogCreate(
                tableName: "Quotes",
                recordId: quote.QuoteId,
                newValue: JsonSerializer.Serialize(logObject)
            );


            await transaction.CommitAsync();

            response.Data = _mapper.Map<QuoteDto>(created);
            response.Message = "Cotización creada correctamente";
            response.Success = true;


            // ENVIAR CORREO (post-commit)
            try
            {
                var customer = await _repositoryCustomer.GetByIdAsync(dto.customerId);

                if (customer != null)
                {
                    await _emailService.SendQuoteCreatedAsync(
                        quote,
                        customer
                    );
                }
            }
            catch (Exception ex)
            {
                await _logHelper.LogCreate(
                 tableName: "Email Quote",
                 recordId: quote.QuoteId,
                 newValue: $"Error enviando el email con el id de cotización {quote.QuoteId}: {ex.Message}"
             );
            }

        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();

            response.Success = false;
            response.Message = $"Error al crear cotización: {ex.Message}";
        }

        return response;
    }


    public async Task<ApiResponse<QuoteDto>> Update(QuoteDto dto)
    {
        var response = new ApiResponse<QuoteDto>();

        try
        {
            var quote = await _repositoryQuote.Query()
                .Include(q => q.QuoteItems)
                .FirstOrDefaultAsync(q => q.QuoteId == dto.quoteId && q.DeletedAt == null);

            if (quote == null)
            {
                response.Success = false;
                response.Message = "Cotización no encontrada";
                return response;
            }

            // Snapshot previo usando DTO para evitar ciclos
            var previousSnapshot = JsonSerializer.Serialize(
                _mapper.Map<QuoteDto>(quote)
            );

            // Actualizar campos principales
            quote.Status = dto.status;
            quote.Total = dto.total;
            quote.Notes = dto.notes;
            quote.SentToEmail = dto.sentToEmail;
            quote.UpdatedAt = DateTime.UtcNow;

            _repositoryQuote.Update(quote);

            var existingItems = quote.QuoteItems!
                .Where(i => i.DeletedAt == null)
                .ToList();

            var dtoItems = dto.items ?? new List<QuoteItemDto>();

            //CREAR O ACTUALIZAR ITEMS

            foreach (var itemDto in dtoItems)
            {
                if (itemDto.quoteItemId > 0)
                {
                    var existingItem = existingItems
                        .FirstOrDefault(i => i.QuoteItemId == itemDto.quoteItemId);

                    if (existingItem != null)
                    {
                        // UPDATE
                        existingItem.ProductId = itemDto.productId;
                        existingItem.Quantity = itemDto.quantity;
                        existingItem.Price = itemDto.price;
                        existingItem.DiscountAmount = itemDto.discountAmount;
                        existingItem.UpdatedAt = DateTime.UtcNow;

                        _repositoryQuoteItem.Update(existingItem);
                    }
                    else
                    {
                        // CREATE si no existe
                        var newItem = new QuoteItem
                        {
                            QuoteId = quote.QuoteId,
                            ProductId = itemDto.productId,
                            Quantity = itemDto.quantity,
                            Price = itemDto.price,
                            DiscountAmount = itemDto.discountAmount,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };

                        await _repositoryQuoteItem.AddAsync(newItem);
                    }
                }
                else
                {
                    // CREATE (item nuevo)
                    var newItem = new QuoteItem
                    {
                        QuoteId = quote.QuoteId,
                        ProductId = itemDto.productId,
                        Quantity = itemDto.quantity,
                        Price = itemDto.price,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _repositoryQuoteItem.AddAsync(newItem);
                }
            }

            //ELIMINAR ITEMS QUE YA NO VIENEN

            var dtoItemIds = dtoItems
                .Where(i => i.quoteItemId > 0)
                .Select(i => i.quoteItemId)
                .ToList();

            foreach (var existingItem in existingItems)
            {
                if (!dtoItemIds.Contains(existingItem.QuoteItemId))
                {
                    existingItem.DeletedAt = DateTime.UtcNow;
                    existingItem.IsActive = false;

                    _repositoryQuoteItem.Update(existingItem);
                }
            }

            await _repositoryQuote.SaveAsync();

            var updated = await _repositoryQuote.Query()
                .Include(q => q.QuoteItems)
                .FirstAsync(q => q.QuoteId == dto.quoteId);

            // Log usando DTO para evitar ciclos
            await _logHelper.LogUpdate(
                tableName: "Quotes",
                recordId: dto.quoteId,
                previousValue: previousSnapshot,
                newValue: JsonSerializer.Serialize(
                    _mapper.Map<QuoteDto>(updated)
                )
            );

            response.Data = _mapper.Map<QuoteDto>(updated);
            response.Message = "Cotización actualizada correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al actualizar cotización: {ex.Message}";
        }

        return response;
    }

    // ACTUALIZAR ESTADO (ACTIVO / INACTIVO)
    public async Task<ApiResponse<bool>> UpdateIsActive(int id, bool isActive)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var quote = await _repositoryQuote
                .FirstOrDefaultAsync(q => q.QuoteId == id);

            if (quote == null)
            {
                response.Success = false;
                response.Message = "Cotización no encontrada";
                return response;
            }

            var previousSnapshot = JsonSerializer.Serialize(quote);

            quote.IsActive = isActive;

            _repositoryQuote.Update(quote);
            await _repositoryQuote.SaveAsync();

            await _logHelper.LogUpdate(
                tableName: "Quotes",
                recordId: quote.QuoteId,
                previousValue: previousSnapshot,
                newValue: JsonSerializer.Serialize(quote)
            );

            response.Data = true;
            response.Message = isActive
                ? "Cotización activada correctamente"
                : "Cotización desactivada correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al actualizar estado de la cotización: {ex.Message}";
        }

        return response;
    }

}
