namespace ArteTextil.DTOs;

public class PayrollAdjustmentDto : DtoBase
{
    public int adjustmentId { get; set; }
    public int userId { get; set; }
    public decimal amount { get; set; }
    public string type { get; set; } = null!;
    public string? reason { get; set; }
    public bool isActive { get; set; }
}