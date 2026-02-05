using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class Promotion : EntityBase
{
    [Key]
    public int PromotionId { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public decimal? DiscountPercent { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public int? ProductId { get; set; }

    public bool IsActive { get; set; }
}
