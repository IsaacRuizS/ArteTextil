namespace ArteTextil.DTOs
{
    public class DemandPredictionDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Month { get; set; } = string.Empty;
        public int TotalQuantity { get; set; }
    }
}
