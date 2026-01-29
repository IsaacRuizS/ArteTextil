namespace ArteTextil.DTOs.Inventario
{
    public class MovimientoInventarioDto
    {
        public int ProductoId { get; set; }
        public string Tipo { get; set; } = null!; // "Entrada" o "Salida"
        public int Cantidad { get; set; }
        public string? Observaciones { get; set; }
        public int UsuarioId { get; set; }
    }
}
