using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using System.Text.Json;

namespace ArteTextil.Business;

public class CartItemBusiness
{
    private readonly IRepositoryCartItem _repositoryCartItem;
    private readonly IRepositoryCart _repositoryCart;
    private readonly IRepositoryCustomer _repositoryCustomer;
    private readonly IRepositoryProduct _repositoryProduct;
    private readonly IMapper _mapper;
    private readonly ISystemLogHelper _logHelper;

    public CartItemBusiness(ArteTextilDbContext context, IMapper mapper, ISystemLogHelper logHelper)
    {
        _repositoryCartItem = new RepositoryCartItem(context);
        _repositoryCart = new RepositoryCart(context);
        _repositoryCustomer = new RepositoryCustomer(context);
        _repositoryProduct = new RepositoryProduct(context);
        _mapper = mapper;
        _logHelper = logHelper;
    }

    private async Task<Customer?> ResolveCustomer(int userId)
    {
        return await _repositoryCustomer.FirstOrDefaultAsync(
            c => c.UserId == userId && c.IsActive && c.DeletedAt == null);
    }

    private async Task<Cart?> ResolveActiveCart(int customerId)
    {
        return await _repositoryCart.FirstOrDefaultAsync(
            c => c.CustomerId == customerId && c.IsActive && c.DeletedAt == null);
    }

    // GET ALL — Admin
    public async Task<ApiResponse<List<CartItemDto>>> GetAll()
    {
        var response = new ApiResponse<List<CartItemDto>>();

        try
        {
            var items = await _repositoryCartItem.GetAllAsync(i => i.DeletedAt == null);
            response.Data = _mapper.Map<List<CartItemDto>>(items);
            response.Message = "Items del carrito obtenidos correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al obtener items: {ex.Message}";
        }

        return response;
    }

    // GET BY ID — Admin
    public async Task<ApiResponse<CartItemDto>> GetById(int id)
    {
        var response = new ApiResponse<CartItemDto>();

        try
        {
            var item = await _repositoryCartItem.FirstOrDefaultAsync(
                i => i.CartItemId == id && i.DeletedAt == null);

            if (item == null)
            {
                response.Success = false;
                response.Message = "Item no encontrado";
                return response;
            }

            response.Data = _mapper.Map<CartItemDto>(item);
            response.Message = "Item obtenido correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al obtener el item: {ex.Message}";
        }

        return response;
    }

    // GET BY CART — Customer: items de su carrito activo
    public async Task<ApiResponse<List<CartItemDto>>> GetMyItems(int userId)
    {
        var response = new ApiResponse<List<CartItemDto>>();

        try
        {
            var customer = await ResolveCustomer(userId);
            if (customer == null)
            {
                response.Success = false;
                response.Message = "No se encontró un perfil de cliente asociado a este usuario";
                return response;
            }

            var cart = await ResolveActiveCart(customer.CustomerId);
            if (cart == null)
            {
                response.Success = false;
                response.Message = "No se encontró un carrito activo";
                return response;
            }

            var items = await _repositoryCartItem.GetAllAsync(
                i => i.CartId == cart.CartId && i.DeletedAt == null);

            response.Data = _mapper.Map<List<CartItemDto>>(items);
            response.Message = "Items obtenidos correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al obtener items: {ex.Message}";
        }

        return response;
    }

    // ADD ITEM — Customer
    public async Task<ApiResponse<CartItemDto>> AddItem(CartItemDto dto, int userId)
    {
        var response = new ApiResponse<CartItemDto>();

        try
        {
            var customer = await ResolveCustomer(userId);
            if (customer == null)
            {
                response.Success = false;
                response.Message = "No se encontró un perfil de cliente asociado a este usuario";
                return response;
            }

            var cart = await ResolveActiveCart(customer.CustomerId);
            if (cart == null)
            {
                response.Success = false;
                response.Message = "No se encontró un carrito activo";
                return response;
            }

            if (cart.CartId != dto.cartId)
            {
                response.Success = false;
                response.Message = "No tienes permisos para agregar items a este carrito";
                return response;
            }

            var product = await _repositoryProduct.FirstOrDefaultAsync(
                p => p.ProductId == dto.productId && p.DeletedAt == null);

            if (product == null)
            {
                response.Success = false;
                response.Message = "Producto no encontrado";
                return response;
            }

            if (dto.quantity <= 0)
            {
                response.Success = false;
                response.Message = "La cantidad debe ser mayor a 0";
                return response;
            }

            // Si el producto ya está en el carrito, suma la cantidad
            var existing = await _repositoryCartItem.FirstOrDefaultAsync(
                i => i.CartId == cart.CartId && i.ProductId == dto.productId && i.DeletedAt == null);

            if (existing != null)
            {
                var previousSnapshot = JsonSerializer.Serialize(_mapper.Map<CartItemDto>(existing));

                existing.Quantity += dto.quantity;
                existing.IsActive = true;
                existing.UpdatedAt = DateTime.UtcNow;

                _repositoryCartItem.Update(existing);
                await _repositoryCartItem.SaveAsync();

                await _logHelper.LogUpdate(
                    tableName: "CartItems",
                    recordId: existing.CartItemId,
                    previousValue: previousSnapshot,
                    newValue: JsonSerializer.Serialize(_mapper.Map<CartItemDto>(existing))
                );

                response.Data = _mapper.Map<CartItemDto>(existing);
                response.Message = "Cantidad actualizada correctamente";
                return response;
            }

            var item = new CartItem
            {
                CartId = cart.CartId,
                ProductId = dto.productId,
                Quantity = dto.quantity,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _repositoryCartItem.AddAsync(item);

            await _logHelper.LogCreate(
                tableName: "CartItems",
                recordId: item.CartItemId,
                newValue: JsonSerializer.Serialize(_mapper.Map<CartItemDto>(item))
            );

            response.Data = _mapper.Map<CartItemDto>(item);
            response.Message = "Item agregado al carrito correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al agregar item: {ex.Message}";
        }

        return response;
    }

    // UPDATE QUANTITY — Customer
    public async Task<ApiResponse<CartItemDto>> UpdateQuantity(CartItemDto dto, int userId)
    {
        var response = new ApiResponse<CartItemDto>();

        try
        {
            var customer = await ResolveCustomer(userId);
            if (customer == null)
            {
                response.Success = false;
                response.Message = "No se encontró un perfil de cliente asociado a este usuario";
                return response;
            }

            var cart = await ResolveActiveCart(customer.CustomerId);
            if (cart == null)
            {
                response.Success = false;
                response.Message = "No se encontró un carrito activo";
                return response;
            }

            var item = await _repositoryCartItem.FirstOrDefaultAsync(
                i => i.CartItemId == dto.cartItemId && i.DeletedAt == null);

            if (item == null)
            {
                response.Success = false;
                response.Message = "Item no encontrado";
                return response;
            }

            if (item.CartId != cart.CartId)
            {
                response.Success = false;
                response.Message = "No tienes permisos para modificar este item";
                return response;
            }

            if (dto.quantity <= 0)
            {
                response.Success = false;
                response.Message = "La cantidad debe ser mayor a 0";
                return response;
            }

            var previousSnapshot = JsonSerializer.Serialize(_mapper.Map<CartItemDto>(item));

            item.Quantity = dto.quantity;
            item.UpdatedAt = DateTime.UtcNow;

            _repositoryCartItem.Update(item);
            await _repositoryCartItem.SaveAsync();

            await _logHelper.LogUpdate(
                tableName: "CartItems",
                recordId: item.CartItemId,
                previousValue: previousSnapshot,
                newValue: JsonSerializer.Serialize(_mapper.Map<CartItemDto>(item))
            );

            response.Data = _mapper.Map<CartItemDto>(item);
            response.Message = "Cantidad actualizada correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al actualizar item: {ex.Message}";
        }

        return response;
    }

    // PATCH STATUS — Admin
    public async Task<ApiResponse<bool>> UpdateStatus(int id, bool isActive)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var item = await _repositoryCartItem.FirstOrDefaultAsync(
                i => i.CartItemId == id && i.DeletedAt == null);

            if (item == null)
            {
                response.Success = false;
                response.Message = "Item no encontrado";
                return response;
            }

            var previousSnapshot = JsonSerializer.Serialize(_mapper.Map<CartItemDto>(item));

            item.IsActive = isActive;
            item.UpdatedAt = DateTime.UtcNow;

            _repositoryCartItem.Update(item);
            await _repositoryCartItem.SaveAsync();

            await _logHelper.LogUpdate(
                tableName: "CartItems",
                recordId: item.CartItemId,
                previousValue: previousSnapshot,
                newValue: JsonSerializer.Serialize(_mapper.Map<CartItemDto>(item))
            );

            response.Data = true;
            response.Message = isActive ? "Item activado correctamente" : "Item desactivado correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al actualizar estado del item: {ex.Message}";
        }

        return response;
    }

    // REMOVE ITEM — Customer (su propio carrito)
    public async Task<ApiResponse<bool>> RemoveItem(int cartItemId, int userId)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var customer = await ResolveCustomer(userId);
            if (customer == null)
            {
                response.Success = false;
                response.Message = "No se encontró un perfil de cliente asociado a este usuario";
                return response;
            }

            var cart = await ResolveActiveCart(customer.CustomerId);
            if (cart == null)
            {
                response.Success = false;
                response.Message = "No se encontró un carrito activo";
                return response;
            }

            var item = await _repositoryCartItem.FirstOrDefaultAsync(
                i => i.CartItemId == cartItemId && i.DeletedAt == null);

            if (item == null)
            {
                response.Success = false;
                response.Message = "Item no encontrado";
                return response;
            }

            if (item.CartId != cart.CartId)
            {
                response.Success = false;
                response.Message = "No tienes permisos para eliminar este item";
                return response;
            }

            item.DeletedAt = DateTime.UtcNow;
            item.IsActive = false;

            _repositoryCartItem.Update(item);
            await _repositoryCartItem.SaveAsync();

            response.Data = true;
            response.Message = "Item eliminado del carrito correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al eliminar item: {ex.Message}";
        }

        return response;
    }

    // SOFT DELETE — Admin
    public async Task<ApiResponse<bool>> Delete(int id)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var item = await _repositoryCartItem.FirstOrDefaultAsync(
                i => i.CartItemId == id && i.DeletedAt == null);

            if (item == null)
            {
                response.Success = false;
                response.Message = "Item no encontrado";
                return response;
            }

            item.DeletedAt = DateTime.UtcNow;
            item.IsActive = false;

            _repositoryCartItem.Update(item);
            await _repositoryCartItem.SaveAsync();

            response.Data = true;
            response.Message = "Item eliminado correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al eliminar item: {ex.Message}";
        }

        return response;
    }
}
