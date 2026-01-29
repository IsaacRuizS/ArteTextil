using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Data.Entities
{
    public class Material : EntityBase
    {
        [Key]
        public int MaterialId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Codigo { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Nombre { get; set; } = null!;

        [MaxLength(100)]
        public string Categoria { get; set; } = "Tela"; // Tela, Accesorio, Insumo

        [MaxLength(50)]
        public string UnidadMedida { get; set; } = "m"; // m, unidad, rollo

        [Column(TypeName = "decimal(18,2)")]
        public decimal CantidadActual { get; set; }

        [MaxLength(200)]
        public string? Ubicacion { get; set; }

        [Required]
        [MaxLength(50)]
        public string Estado { get; set; } = "ACTIVO"; // ACTIVO, BAJO_STOCK, AGOTADO, INACTIVO

        [Column(TypeName = "decimal(18,2)")]
        public decimal StockMinimo { get; set; }

        public DateTime FechaUltimoMovimiento { get; set; } = DateTime.Now;

        public string? Observaciones { get; set; }

        // Relación con movimientos
        public virtual ICollection<MovimientoInventario> Movimientos { get; set; } = new List<MovimientoInventario>();
    }
}
