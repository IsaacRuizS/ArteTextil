using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class OrderItem : EntityBase
{
    [Key]
    public int OrderItemId { get; set; }

    public int OrderId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal Price { get; set; }

    public bool IsActive { get; set; }

    // Navigation
    public Order? Order { get; set; }
}