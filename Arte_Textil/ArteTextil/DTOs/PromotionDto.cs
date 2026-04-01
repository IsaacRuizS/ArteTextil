namespace ArteTextil.DTOs;

public class PromotionDto : DtoBase
{
    public int promotionId { get; set; }
    public required string name { get; set; }
    public string? description { get; set; }
    public decimal discountPercent { get; set; }
    public DateTime? startDate { get; set; }
    public DateTime? endDate { get; set; }
    public int productId { get; set; }
    public bool isActive { get; set; }

    // Relación
    public string? productName { get; set; }
}
