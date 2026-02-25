namespace ArteTextil.DTOs
{
    public class CustomerSegmentDto
    {
        public int customerId { get; set; }
        public string fullName { get; set; }
        public int quotesCount { get; set; }
        public DateTime? lastQuote { get; set; }
        public string segment { get; set; }
    }
}