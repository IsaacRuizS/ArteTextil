using GEG.Common.Data.Models;
using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Entities;



public class Rol : EntityBase
{
    [Key]
    public int RoleId { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public bool IsActive { get; set; }
}
