namespace ArteTextil.DTOs
{
    public class DemandPredictionDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Year { get; set; }
        public int MonthNumber { get; set; }
        public string Month { get; set; } = string.Empty;
        public int TotalQuantity { get; set; }
        public bool IsForecast { get; set; }
    }
}
