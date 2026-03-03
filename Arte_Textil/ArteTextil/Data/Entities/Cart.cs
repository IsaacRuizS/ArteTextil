using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class Cart : EntityBase
{
    [Key]
    public int CartId { get; set; }

    public int CustomerId { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Active";

    public bool IsActive { get; set; } = true;
}
