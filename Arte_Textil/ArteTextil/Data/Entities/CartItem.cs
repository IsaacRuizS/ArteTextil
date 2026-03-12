using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class CartItem : EntityBase
{
    [Key]
    public int CartItemId { get; set; }

    public int CartId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public bool IsActive { get; set; } = true;
}
