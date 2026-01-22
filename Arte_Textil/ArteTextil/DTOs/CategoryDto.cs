namespace ArteTextil.DTOs
{
    public class CategoryDto : DtoBase
    {
        public int categoryId { get; set; }
        public string name { get; set; } = null!;
        public string? description { get; set; }
        public bool isActive { get; set; }
    }
}
