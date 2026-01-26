namespace ArteTextil.DTOs;

public class UserDto : DtoBase
{
    public int userId { get; set; }
    public required string fullName { get; set; }
    public required string email { get; set; }
    public string? passwordHash { get; set; }
    public required string phone { get; set; }
    public required DateTime? lastLoginAt { get; set; }
    public required int roleId { get; set; }
    public bool isActive { get; set; }
};

