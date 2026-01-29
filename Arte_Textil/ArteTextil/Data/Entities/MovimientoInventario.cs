using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Data.Entities
{
    public class MovimientoInventario : EntityBase
    {
        [Key]
        public int MovimientoId { get; set; }

        [ForeignKey("Material")]
        public int MaterialId { get; set; }
        public virtual Material? Material { get; set; }

        [Required]
        [MaxLength(50)]
        public string Tipo { get; set; } = null!; // ENTRADA, SALIDA, AJUSTE, CAMBIO_ESTADO

        [Column(TypeName = "decimal(18,2)")]
        public decimal Cantidad { get; set; }

        public DateTime FechaMovimiento { get; set; } = DateTime.Now;

        public string Descripcion { get; set; } = null!; // Motivo del movimiento

        [MaxLength(50)]
        public string? EstadoAnterior { get; set; }

        [MaxLength(50)]
        public string? EstadoNuevo { get; set; }
    }
}
