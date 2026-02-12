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

    public bool IsActive { get; set; } = true;

    // Navigation
    [ForeignKey(nameof(QuoteId))]
    public Quote? Quote { get; set; }
}
