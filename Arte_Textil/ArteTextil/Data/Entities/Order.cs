using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class Order : EntityBase
{
    [Key]
    public int OrderId { get; set; }
    public int QuoteId { get; set; }
    public int CustomerId { get; set; }

    public required string Status { get; set; }

    public DateTime? DeliveryDate { get; set; }

    public string? Notes { get; set; }

    public bool IsActive { get; set; }

    // Navigation properties
    public ICollection<OrderItem>? OrderItems { get; set; }
    public ICollection<OrderStatusHistory>? OrderStatusHistory { get; set; }
    
    public Customer? Customer { get; set; }
    public Quote? Quote { get; set; }
}