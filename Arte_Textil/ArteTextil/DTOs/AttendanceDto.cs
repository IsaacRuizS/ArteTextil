namespace ArteTextil.DTOs;

public class AttendanceDto : DtoBase
{
    public int attendanceId { get; set; }
    public int userId { get; set; }
    public DateTime? checkIn { get; set; }
    public DateTime? checkOut { get; set; }
    public bool isActive { get; set; }
}