using System;
using System.ComponentModel.DataAnnotations;

namespace GEG.Common.Data.Models
{
    public class DtoBase
    {
        public DateTime createdAt { get; set; } = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time"));
        public DateTime? updatedAt { get; set; }
        public DateTime? deletedAt { get; set; }
    }
}
