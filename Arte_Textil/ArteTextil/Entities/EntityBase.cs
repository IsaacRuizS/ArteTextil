using System;
using System.ComponentModel.DataAnnotations;

namespace GEG.Common.Data.Models
{
    public class EntityBase
    {
        public DateTime CreatedAt { get; set; } = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time"));
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
