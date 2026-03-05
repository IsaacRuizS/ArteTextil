using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using System.Text.Json;

namespace ArteTextil.Business;

public class CartBusiness
{
    private readonly IRepositoryCart _repositoryCart;
    private readonly IRepositoryCustomer _repositoryCustomer;
    private readonly IMapper _mapper;
    private readonly ISystemLogHelper _logHelper;

    public CartBusiness(ArteTextilDbContext context, IMapper mapper, ISystemLogHelper logHelper)
    {
        _repositoryCart = new RepositoryCart(context);
        _repositoryCustomer = new RepositoryCustomer(context);
        _mapper = mapper;
        _logHelper = logHelper;
    }

    // Resuelve el Customer activo a partir del UserId del token
    private async Task<Customer?> ResolveCustomer(int userId)
    {
        return await _repositoryCustomer.FirstOrDefaultAsync(
            c => c.UserId == userId && c.IsActive && c.DeletedAt == null);
    }

    // GET ALL — Admin/Empleado
    public async Task<ApiResponse<List<CartDto>>> GetAll()
    {
        var response = new ApiResponse<List<CartDto>>();

        try
        {
            var carts = await _repositoryCart.GetAllAsync(c => c.DeletedAt == null);
            response.Data = _mapper.Map<List<CartDto>>(carts);
            response.Message = "Carritos obtenidos correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al obtener carritos: {ex.Message}";
        }

        return response;
    }

    // GET BY ID — Admin/Empleado
    public async Task<ApiResponse<CartDto>> GetById(int id)
    {
        var response = new ApiResponse<CartDto>();

        try
        {
            var cart = await _repositoryCart.FirstOrDefaultAsync(
                c => c.CartId == id && c.DeletedAt == null);

            if (cart == null)
            {
                response.Success = false;
                response.Message = "Carrito no encontrado";
                return response;
            }

            response.Data = _mapper.Map<CartDto>(cart);
            response.Message = "Carrito obtenido correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al obtener el carrito: {ex.Message}";
        }

        return response;
    }

    // GET BY USER — Customer: solo su propio carrito
    public async Task<ApiResponse<CartDto>> GetByUserId(int userId)
    {
        var response = new ApiResponse<CartDto>();

        try
        {
            var customer = await ResolveCustomer(userId);
            if (customer == null)
            {
                response.Success = false;
                response.Message = "No se encontró un perfil de cliente asociado a este usuario";
                return response;
            }

            var cart = await _repositoryCart.FirstOrDefaultAsync(
                c => c.CustomerId == customer.CustomerId && c.IsActive && c.DeletedAt == null);

            if (cart == null)
            {
                response.Success = false;
                response.Message = "No se encontró un carrito activo";
                return response;
            }

            response.Data = _mapper.Map<CartDto>(cart);
            response.Message = "Carrito obtenido correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al obtener el carrito: {ex.Message}";
        }

        return response;
    }

    // CREATE — Customer: crea su propio carrito
    public async Task<ApiResponse<CartDto>> Create(int userId)
    {
        var response = new ApiResponse<CartDto>();

        try
        {
            var customer = await ResolveCustomer(userId);
            if (customer == null)
            {
                response.Success = false;
                response.Message = "No se encontró un perfil de cliente asociado a este usuario";
                return response;
            }

            var existing = await _repositoryCart.AnyAsync(
                c => c.CustomerId == customer.CustomerId && c.IsActive && c.DeletedAt == null);

            if (existing)
            {
                response.Success = false;
                response.Message = "Ya tienes un carrito activo";
                return response;
            }

            var cart = new Cart
            {
                CustomerId = customer.CustomerId,
                Status = "Active",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _repositoryCart.AddAsync(cart);

            await _logHelper.LogCreate(
                tableName: "Carts",
                recordId: cart.CartId,
                newValue: JsonSerializer.Serialize(_mapper.Map<CartDto>(cart))
            );

            response.Data = _mapper.Map<CartDto>(cart);
            response.Message = "Carrito creado correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al crear el carrito: {ex.Message}";
        }

        return response;
    }

    // UPDATE — Customer: solo puede modificar su propio carrito
    public async Task<ApiResponse<CartDto>> Update(CartDto dto, int userId)
    {
        var response = new ApiResponse<CartDto>();

        try
        {
            var customer = await ResolveCustomer(userId);
            if (customer == null)
            {
                response.Success = false;
                response.Message = "No se encontró un perfil de cliente asociado a este usuario";
                return response;
            }

            var cart = await _repositoryCart.FirstOrDefaultAsync(
                c => c.CartId == dto.cartId && c.DeletedAt == null);

            if (cart == null)
            {
                response.Success = false;
                response.Message = "Carrito no encontrado";
                return response;
            }

            if (cart.CustomerId != customer.CustomerId)
            {
                response.Success = false;
                response.Message = "No tienes permisos para modificar este carrito";
                return response;
            }

            var previousSnapshot = JsonSerializer.Serialize(_mapper.Map<CartDto>(cart));

            cart.Status = dto.status;
            cart.IsActive = dto.isActive;
            cart.UpdatedAt = DateTime.UtcNow;

            _repositoryCart.Update(cart);
            await _repositoryCart.SaveAsync();

            await _logHelper.LogUpdate(
                tableName: "Carts",
                recordId: cart.CartId,
                previousValue: previousSnapshot,
                newValue: JsonSerializer.Serialize(_mapper.Map<CartDto>(cart))
            );

            response.Data = _mapper.Map<CartDto>(cart);
            response.Message = "Carrito actualizado correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al actualizar el carrito: {ex.Message}";
        }

        return response;
    }

    // PATCH STATUS — Admin/Empleado
    public async Task<ApiResponse<bool>> UpdateStatus(int id, bool isActive)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var cart = await _repositoryCart.FirstOrDefaultAsync(
                c => c.CartId == id && c.DeletedAt == null);

            if (cart == null)
            {
                response.Success = false;
                response.Message = "Carrito no encontrado";
                return response;
            }

            var previousSnapshot = JsonSerializer.Serialize(_mapper.Map<CartDto>(cart));

            cart.IsActive = isActive;
            cart.UpdatedAt = DateTime.UtcNow;

            _repositoryCart.Update(cart);
            await _repositoryCart.SaveAsync();

            await _logHelper.LogUpdate(
                tableName: "Carts",
                recordId: cart.CartId,
                previousValue: previousSnapshot,
                newValue: JsonSerializer.Serialize(_mapper.Map<CartDto>(cart))
            );

            response.Data = true;
            response.Message = isActive ? "Carrito activado correctamente" : "Carrito desactivado correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al actualizar estado del carrito: {ex.Message}";
        }

        return response;
    }

    // SOFT DELETE — Admin/Empleado
    public async Task<ApiResponse<bool>> Delete(int id)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var cart = await _repositoryCart.FirstOrDefaultAsync(
                c => c.CartId == id && c.DeletedAt == null);

            if (cart == null)
            {
                response.Success = false;
                response.Message = "Carrito no encontrado";
                return response;
            }

            cart.DeletedAt = DateTime.UtcNow;
            cart.IsActive = false;

            _repositoryCart.Update(cart);
            await _repositoryCart.SaveAsync();

            response.Data = true;
            response.Message = "Carrito eliminado correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error al eliminar el carrito: {ex.Message}";
        }

        return response;
    }
}
