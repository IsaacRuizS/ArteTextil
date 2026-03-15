using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class PayrollMonthly : EntityBase
{
    [Key]
    public int PayrollId { get; set; }

    public int UserId { get; set; }

    public int Year { get; set; }

    public int Month { get; set; }

    public decimal BaseSalary { get; set; }

    public decimal Extras { get; set; }

    public decimal Deductions { get; set; }

    public decimal Total { get; set; }

    public int? ApprovedByUserId { get; set; }

    public bool IsActive { get; set; }
}
