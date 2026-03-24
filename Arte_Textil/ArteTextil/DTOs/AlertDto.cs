namespace ArteTextil.DTOs;

public class AlertDto : DtoBase
{
    public long alertId { get; set; }
    public string? title { get; set; }
    public string? message { get; set; }
    public bool isRead { get; set; }
}