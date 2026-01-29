namespace ArteTextil.DTOs.Inventario
{
    public class ProductoInventarioDto
    {
        public int ProductId { get; set; }
        public string Codigo { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public int Stock { get; set; }
        public int StockMinimo { get; set; }
        public string? Ubicacion { get; set; }
        public string? Estado { get; set; }
        public decimal Precio { get; set; }
        public int CategoriaId { get; set; }
        public string? CategoriaNombre { get; set; }
    }
}
