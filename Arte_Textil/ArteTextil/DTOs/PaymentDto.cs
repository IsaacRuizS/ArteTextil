namespace ArteTextil.DTOs;

public class PaymentDto
{
    public int paymentId { get; set; }

    public int payrollId { get; set; }

    public string userName { get; set; }

    public decimal amount { get; set; }

    public DateTime paymentDate { get; set; }

    public string method { get; set; }

    public bool isActive { get; set; }
}