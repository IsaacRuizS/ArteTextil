namespace ArteTextil.DTOs.Inventario
{
    public class CrearInventarioDto
    {
        public string Codigo { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public int Cantidad { get; set; }
        public string? Ubicacion { get; set; }
        public string? Estado { get; set; }
        public int StockMinimo { get; set; }
        public string? Observaciones { get; set; }
        public int CategoriaId { get; set; }
        public decimal? Precio { get; set; }
    }
}
