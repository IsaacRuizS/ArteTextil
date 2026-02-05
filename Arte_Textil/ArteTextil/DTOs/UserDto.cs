namespace ArteTextil.DTOs;

public class PromotionDto : DtoBase
{
    public long promotionId { get; set; }

    public required string name { get; set; }

    public string? description { get; set; }

    public decimal? discountPercent { get; set; }

    public DateTime? startDate { get; set; }

    public DateTime? endDate { get; set; }

    public long? productId { get; set; }

    public bool isActive { get; set; }

    public DateTime? createdAt { get; set; }

    public DateTime? updatedAt { get; set; }

    public DateTime? deletedAt { get; set; }
}
