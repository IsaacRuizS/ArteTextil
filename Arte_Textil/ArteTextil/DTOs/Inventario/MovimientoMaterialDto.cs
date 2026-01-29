namespace ArteTextil.DTOs.Inventario
{
    public class MovimientoMaterialDto
    {
        public int MovimientoId { get; set; }
        public int MaterialId { get; set; }
        public string MaterialNombre { get; set; } = null!;
        public string Tipo { get; set; } = null!;
        public decimal Cantidad { get; set; }
        public DateTime FechaMovimiento { get; set; }
        public string Descripcion { get; set; } = null!;
        public string? EstadoAnterior { get; set; }
        public string? EstadoNuevo { get; set; }
    }

    public class RegistrarMovimientoMaterialDto
    {
        public int MaterialId { get; set; }
        public string Tipo { get; set; } = null!; // ENTRADA, SALIDA, AJUSTE
        public decimal Cantidad { get; set; }
        public string Descripcion { get; set; } = null!;
    }
}
