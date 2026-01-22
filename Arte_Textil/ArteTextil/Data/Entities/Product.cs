using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Data.Entities
{
    public class Product : EntityBase
    {
        [Key]
        public int ProductId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = null!;

        public string? Description { get; set; }

        [MaxLength(50)]
        public string? ProductCode { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int Stock { get; set; }

        public int MinStock { get; set; }

        public string? Status { get; set; }

        [ForeignKey("Category")]
        public int CategoryId { get; set; }

        [ForeignKey("Supplier")]
        public int SupplierId { get; set; }

        public bool IsActive { get; set; }

        // Relaciones
        public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
    }
}
