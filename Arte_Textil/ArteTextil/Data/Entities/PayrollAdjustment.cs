using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class PayrollAdjustment : EntityBase
{
    [Key]
    public int AdjustmentId { get; set; }

    public int UserId { get; set; }

    public decimal Amount { get; set; }

    public int Year { get; set; }

    public int Month { get; set; }

    public string Type { get; set; } = null!; // Extra o Rebajo

    public string? Reason { get; set; }

    public bool IsActive { get; set; }

    public bool Applied { get; set; } = false;
}