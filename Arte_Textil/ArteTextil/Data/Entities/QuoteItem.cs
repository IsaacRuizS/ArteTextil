using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Data.Entities;

public class QuoteItem : EntityBase
{
    [Key]
    public int QuoteItemId { get; set; }

    public int QuoteId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal Price { get; set; }

    public decimal DiscountAmount { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    [ForeignKey("ProductId")]
    public Product? Product { get; set; }

    // Navigation
    [ForeignKey(nameof(QuoteId))]
    public Quote? Quote { get; set; }
}
