using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Data.Entities;

public class InventoryMovement : EntityBase
{
    [Key]
    public int MovementId { get; set; }

    [ForeignKey("Product")]
    public int ProductId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = null!; // Entrada, Salida, Ajuste

    public int Quantity { get; set; }

    [MaxLength(255)]
    public string? Reason { get; set; }

    public int PreviousStock { get; set; }

    public int NewStock { get; set; }

    [ForeignKey("User")]
    public int PerformedByUserId { get; set; }

    public bool IsActive { get; set; }

    // Relaciones
    public virtual Product? Product { get; set; }
    public virtual User? PerformedByUser { get; set; }
}
