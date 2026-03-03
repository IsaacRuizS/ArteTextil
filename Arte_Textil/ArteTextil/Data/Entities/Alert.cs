using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class Alert : EntityBase
{
    [Key]
    public int AlertId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;
}