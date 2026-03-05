namespace ArteTextil.DTOs;

public class OrderDto : DtoBase
{
    public int orderId { get; set; }
    public int quoteId { get; set; }

    public required int customerId { get; set; }

    public required string status { get; set; }

    public DateTime? deliveryDate { get; set; }

    public string? notes { get; set; }

    public bool isActive { get; set; }

    public CustomerDto? customer { get; set; }

    public QuoteDto? quote { get; set; }

    public List<OrderItemDto>? items { get; set; }

    public List<OrderStatusHistoryDto>? statusHistory { get; set; }
}