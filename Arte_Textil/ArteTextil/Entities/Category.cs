using GEG.Common.Data.Models;
using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Entities
{
    public class Category : EntityBase
    {
        [Key]
        public int CategoryId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }
}
