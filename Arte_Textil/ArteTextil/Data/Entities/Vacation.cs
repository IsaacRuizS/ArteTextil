using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class Vacation : EntityBase
{
    [Key]
    public int VacationId { get; set; }

    public int UserId { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public string Status { get; set; }
    public int? ApprovedByUserId { get; set; }

    public bool IsActive { get; set; }
}