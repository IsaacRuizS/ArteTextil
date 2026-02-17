
using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class User : EntityBase
{
    [Key]
    public int UserId { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public required string Phone { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public required int RoleId { get; set; }
    public bool IsActive { get; set; }
}
