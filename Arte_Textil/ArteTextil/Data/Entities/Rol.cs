using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities;

public class Rol : EntityBase
{
    [Key]
    public int RoleId { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public bool IsActive { get; set; }
}
