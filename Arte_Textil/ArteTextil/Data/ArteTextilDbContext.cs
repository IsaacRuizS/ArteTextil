using Microsoft.EntityFrameworkCore;
using ArteTextil.Data.Entities;

namespace ArteTextil.Data;

public class ArteTextilDbContext : DbContext
{
    public ArteTextilDbContext(DbContextOptions<ArteTextilDbContext> options)
        : base(options)
    {
    }

    public DbSet<Rol> Roles { get; set; }
    // public DbSet<Usuario> Usuarios { get; set; }
}
