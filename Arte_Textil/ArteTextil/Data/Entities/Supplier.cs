using GEG.Common.Data.Models;
using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Entities;

public class Supplier : EntityBase
{
    [Key]
    public int SupplierId { get; set; }
    public required string Name { get; set; }
    public required string Phone { get; set; }
    public required string Email { get; set; }
    public required string ContactPerson { get; set; }
    public bool IsActive { get; set; }
}