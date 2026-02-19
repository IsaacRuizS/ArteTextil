namespace ArteTextil.DTOs;

public class QuoteDto : DtoBase
{
    public int quoteId { get; set; }
    public int customerId { get; set; }
    public string status { get; set; } = string.Empty;
    public decimal total { get; set; }
    public string? notes { get; set; }
    public int createdByUserId { get; set; }
    public string? sentToEmail { get; set; }
    public bool isActive { get; set; }

    public List<QuoteItemDto>? items { get; set; }
    public CustomerDto? Customer { get; set; }

}
