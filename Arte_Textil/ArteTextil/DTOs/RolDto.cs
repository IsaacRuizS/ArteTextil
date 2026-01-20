using GEG.Common.Data.Models;

namespace ArteTextil.DTOs;

// A DTO is a contract between the client and server since it represents
// a shared agreement about how data will be transferred and used.

public class RolDto : DtoBase
{
    public int roleId { get; set; }
     public required string name { get; set; }
     public required string description { get; set; }
     public bool isActive { get; set; }

};
