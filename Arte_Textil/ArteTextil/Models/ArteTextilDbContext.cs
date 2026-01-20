using Microsoft.EntityFrameworkCore;

using ArteTextil.Entities;

namespace ArteTextil.Models;

public class ArteTextilDbContext : DbContext
{
    public ArteTextilDbContext(DbContextOptions<ArteTextilDbContext> options)
        : base(options)
    {
    }

    // Ejemplo de tablas
    public DbSet<Rol> Roles { get; set; }
    // public DbSet<Usuario> Usuarios { get; set; }
}
