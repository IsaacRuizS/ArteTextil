namespace ArteTextil.DTOs
{
    public class SystemLogDto : DtoBase
    {
        public int logId { get; set; }
        public string action { get; set; } = null!;
        public int? userId { get; set; }
        public string? tableName { get; set; }
        public int? recordId { get; set; }
        public string? previousValue { get; set; }
        public string? newValue { get; set; }
        public bool isActive { get; set; }
    }
}
