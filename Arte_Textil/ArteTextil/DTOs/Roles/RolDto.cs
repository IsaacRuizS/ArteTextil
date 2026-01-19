
namespace ArteTextil.DTOs.Roles;

// A DTO is a contract between the client and server since it represents
// a shared agreement about how data will be transferred and used.

public record RolDto(
    int Id,
    string Name,
    string Description,
    bool IsActive,
    DateOnly CreatedAt,
    DateOnly UpdatedAt,
    DateOnly DeletedAt
);
