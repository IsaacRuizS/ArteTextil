using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class Attendance : EntityBase
{
    [Key]
    public int AttendanceId { get; set; }

    public int UserId { get; set; }

    public DateTime? CheckIn { get; set; }
    public DateTime? CheckOut { get; set; }

    public bool IsActive { get; set; }
}