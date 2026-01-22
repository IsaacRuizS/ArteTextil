using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Data.Entities
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

        // Relación
        public virtual Product? Product { get; set; }
    }
}
