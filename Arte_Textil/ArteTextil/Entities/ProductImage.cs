using GEG.Common.Data.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Entities
{
    public class ProductImage : EntityBase
    {
        [Key]
        public int ProductImageId { get; set; }

        [ForeignKey("Product")]
        public int ProductId { get; set; }

        [Required]
        public string ImageUrl { get; set; } = null!;

        public bool IsMain { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? DeletedAt { get; set; }

        // Relación
        public virtual Product? Product { get; set; }
    }
}
