using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class Salary : EntityBase
{
    [Key]
    public int SalaryId { get; set; }

    public int UserId { get; set; }

    public decimal BaseSalary { get; set; }

    public bool IsActive { get; set; }
}