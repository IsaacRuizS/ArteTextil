namespace ArteTextil.DTOs;

public class LoginDto : DtoBase
{
    public required string email { get; set; }
    public required string password { get; set; }
}
