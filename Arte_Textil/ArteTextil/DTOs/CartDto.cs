namespace ArteTextil.DTOs;

public class CartDto : DtoBase
{
    public int cartId { get; set; }
    public int customerId { get; set; }
    public string status { get; set; } = "Active";
    public bool isActive { get; set; }
}
