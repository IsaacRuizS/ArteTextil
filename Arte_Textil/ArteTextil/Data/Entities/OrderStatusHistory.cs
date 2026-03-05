using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class OrderStatusHistory : EntityBase
{
    [Key]
    public int OrderStatusHistoryId { get; set; }

    public int OrderId { get; set; }

    public required string Status { get; set; }

    public int? PerformedByUserId { get; set; }

    public bool IsActive { get; set; }

    // Navigation
    public Order? Order { get; set; }
}