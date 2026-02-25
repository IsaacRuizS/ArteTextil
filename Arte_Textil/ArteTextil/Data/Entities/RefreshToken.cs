using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class RefreshToken
{
    [Key]
    public int Id { get; set; }
    public required string Token { get; set; }
    public int UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    public bool IsRevoked => RevokedAt.HasValue;

    public User User { get; set; } = null!;
}
