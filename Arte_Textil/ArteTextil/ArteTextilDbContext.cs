using Microsoft.EntityFrameworkCore;

using ArteTextil.Entities;

namespace ArteTextil;

public class ArteTextilDbContext : DbContext
{
    public ArteTextilDbContext(DbContextOptions<ArteTextilDbContext> options)
        : base(options)
    {
    }

    public DbSet<Rol> Roles { get; set; }
    // public DbSet<Usuario> Usuarios { get; set; }
}
