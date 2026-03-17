namespace ArteTextil.DTOs;

public class CartItemDto : DtoBase
{
    public int cartItemId { get; set; }
    public int cartId { get; set; }
    public int productId { get; set; }
    public int quantity { get; set; }
    public bool isActive { get; set; } = true;
}
