namespace ArteTextil.DTOs
{
    public class ProductImageDto : DtoBase
    {
        public int productImageId { get; set; }
        public int productId { get; set; }
        public required string imageUrl { get; set; }
        public bool isMain { get; set; }
        public bool isActive { get; set; }
    }
}
