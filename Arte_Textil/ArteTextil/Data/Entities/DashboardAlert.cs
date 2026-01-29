using System.ComponentModel.DataAnnotations;

namespace ArteTextil.Data.Entities
{
    public class DashboardAlert : EntityBase
    {
        [Key]
        public int AlertId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Type { get; set; } = null!; // "StockBajo", "Sistema", etc.

        [Required]
        public string Description { get; set; } = null!;

        public int? RelatedEntityId { get; set; }

        public bool IsRead { get; set; } = false;

        public bool IsActive { get; set; } = true;
    }
}
