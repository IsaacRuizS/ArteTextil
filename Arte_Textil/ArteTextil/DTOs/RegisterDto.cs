namespace ArteTextil.DTOs;

public class RegisterDto
{
    public required string fullName { get; set; }
    public required string email { get; set; }
    public required string password { get; set; }
    public required string phone { get; set; }
}
