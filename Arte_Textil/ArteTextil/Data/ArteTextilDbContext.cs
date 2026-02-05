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
    public DbSet<User> Users { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }
    public DbSet<SystemLog> SystemLogs { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Attendance> Attendance { get; set; }
    public DbSet<Vacation> Vacations { get; set; }
    public DbSet<PayrollAdjustment> PayrollAdjustments { get; set; }
    public DbSet<Promotion> Promotions { get; set; }


    // public DbSet<Usuario> Usuarios { get; set; }
}
