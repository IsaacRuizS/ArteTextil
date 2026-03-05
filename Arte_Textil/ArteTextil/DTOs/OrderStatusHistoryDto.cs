namespace ArteTextil.DTOs;

public class OrderStatusHistoryDto : DtoBase
{
    public int orderStatusHistoryId { get; set; }

    public required int orderId { get; set; }

    public required string status { get; set; }

    public int? performedByUserId { get; set; }

    public bool isActive { get; set; }
}