namespace ArteTextil.DTOs
{
    public class ProductDto : DtoBase
    {
        public int productId { get; set; }
        public required string name { get; set; }
        public string? description { get; set; }
        public string? productCode { get; set; }
        public decimal price { get; set; }
        public int stock { get; set; }
        public int minStock { get; set; }
        public string? status { get; set; }
        public int categoryId { get; set; }
        public int supplierId { get; set; }
        public bool isActive { get; set; }

        // Relacionado
        public List<ProductImageDto>? productImages { get; set; }
    }
}
