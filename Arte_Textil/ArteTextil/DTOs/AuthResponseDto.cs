using ArteTextil.DTOs;

namespace ArteTextil.DTOs
{
    public class AuthResponseDto
    {
        public UserDto User { get; set; }
        public string Token { get; set; }
    }
}
