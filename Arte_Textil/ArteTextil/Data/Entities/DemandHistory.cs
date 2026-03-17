namespace ArteTextil.Data.Entities;

public class DemandHistory
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalQuantity { get; set; }
    public string Source { get; set; } = string.Empty;
}
