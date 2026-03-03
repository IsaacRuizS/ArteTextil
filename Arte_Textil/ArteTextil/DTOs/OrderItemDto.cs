namespace ArteTextil.DTOs;

public class OrderItemDto : DtoBase
{
    public int orderItemId { get; set; }

    public required int orderId { get; set; }

    public required int productId { get; set; }

    public required int quantity { get; set; }

    public required decimal price { get; set; }

    public bool isActive { get; set; }
}