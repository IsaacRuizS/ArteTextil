using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class Customer : EntityBase
{
    [Key]
    public int CustomerId { get; set; }

    public required string FullName { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? Classification { get; set; }

    public int? ActivityScore { get; set; }

    public DateTime? LastQuoteDate { get; set; }

    public int? UserId { get; set; }

    public bool IsActive { get; set; } = true;
}
