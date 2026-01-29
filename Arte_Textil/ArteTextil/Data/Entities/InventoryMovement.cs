using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Data.Entities
{
    public class InventoryMovement : EntityBase
    {
        [Key]
        public int MovementId { get; set; }

        [ForeignKey("Product")]
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = null!; // "Entrada" o "Salida"

        public int Quantity { get; set; }

        public int PreviousStock { get; set; }

        public int NewStock { get; set; }

        public string? Observations { get; set; }

        public int PerformedByUserId { get; set; }

        public DateTime MovementDate { get; set; }
    }
}
