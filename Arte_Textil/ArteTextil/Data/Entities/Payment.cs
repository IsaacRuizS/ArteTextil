using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class Payment : EntityBase
{
    [Key]
    public int PayrollId { get; set; }

    public DateTime PaymentDate { get; set; }

    public decimal Amount { get; set; }

    public string Method { get; set; }

    public bool IsActive { get; set; }
}