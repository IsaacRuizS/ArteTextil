using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Data.Entities;

public class Quote : EntityBase
{
    [Key]
    public int QuoteId { get; set; }

    public int CustomerId { get; set; }

    public required string Status { get; set; }

    public decimal Total { get; set; }

    public string? Notes { get; set; }

    public int? CreatedByUserId { get; set; }

    public string? SentToEmail { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<QuoteItem>? QuoteItems { get; set; }
}
