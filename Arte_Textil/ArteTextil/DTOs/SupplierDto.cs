namespace ArteTextil.DTOs;

// A DTO is a contract between the client and server since it represents
// a shared agreement about how data will be transferred and used.

public class SupplierDto : DtoBase
{
    public int supplierId { get; set; }
    public required string name { get; set; }
    public required string phone { get; set; }
    public required string email { get; set; }
    public required string contactPerson { get; set; }
    public bool isActive { get; set; }
};
 