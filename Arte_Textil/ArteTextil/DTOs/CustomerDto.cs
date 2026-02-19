namespace ArteTextil.DTOs;

public class CustomerDto : DtoBase
{
    public int customerId { get; set; }
    public string fullName { get; set; } = string.Empty;
    public string? email { get; set; }
    public string? phone { get; set; }
    public string? classification { get; set; }
    public int? activityScore { get; set; }
    public DateTime? lastQuoteDate { get; set; }
    public int? userId { get; set; }
    public bool isActive { get; set; }
}
