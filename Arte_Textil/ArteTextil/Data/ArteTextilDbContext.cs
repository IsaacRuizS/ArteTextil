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
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }
    public DbSet<SystemLog> SystemLogs { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<InventoryMovement> InventoryMovements { get; set; }
    public DbSet<DashboardAlert> DashboardAlerts { get; set; }
    
    // Nuevas entidades para módulo de Inventario según PDF
    public DbSet<Material> Materiales { get; set; }
    public DbSet<MovimientoInventario> MovimientosInventario { get; set; }

    // public DbSet<Usuario> Usuarios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed de materiales según el PDF
        modelBuilder.Entity<Material>().HasData(
            new Material
            {
                MaterialId = 1,
                Codigo = "PR-001",
                Nombre = "Tela deportiva dry fit jik",
                Categoria = "Tela",
                UnidadMedida = "m",
                CantidadActual = 100,
                StockMinimo = 20,
                Ubicacion = "Bodega 1 - Estante H1",
                Estado = "ACTIVO",
                FechaUltimoMovimiento = DateTime.Parse("2026-01-15"),
                Observaciones = "Material de alta calidad para ropa deportiva"
            },
            new Material
            {
                MaterialId = 2,
                Codigo = "PR-002",
                Nombre = "Tela deportiva dry fit cool plus",
                Categoria = "Tela",
                UnidadMedida = "m",
                CantidadActual = 0,
                StockMinimo = 20,
                Ubicacion = "Bodega 1 - Estante H1",
                Estado = "AGOTADO",
                FechaUltimoMovimiento = DateTime.Parse("2026-01-20"),
                Observaciones = "Material agotado - requiere reposición urgente"
            },
            new Material
            {
                MaterialId = 3,
                Codigo = "PR-003",
                Nombre = "Tela licra - color negro",
                Categoria = "Tela",
                UnidadMedida = "m",
                CantidadActual = 15,
                StockMinimo = 20,
                Ubicacion = "Bodega 1 - Estante H2",
                Estado = "BAJO_STOCK",
                FechaUltimoMovimiento = DateTime.Parse("2026-01-22"),
                Observaciones = "Tela elástica para prendas ajustadas"
            },
            new Material
            {
                MaterialId = 4,
                Codigo = "PR-004",
                Nombre = "Tela algodón - color blanco",
                Categoria = "Tela",
                UnidadMedida = "m",
                CantidadActual = 60,
                StockMinimo = 15,
                Ubicacion = "Bodega 2 - Estante A3",
                Estado = "ACTIVO",
                FechaUltimoMovimiento = DateTime.Parse("2026-01-18"),
                Observaciones = "Algodón 100% natural"
            },
            new Material
            {
                MaterialId = 5,
                Codigo = "PR-005",
                Nombre = "Botones color negro",
                Categoria = "Accesorio",
                UnidadMedida = "unidad",
                CantidadActual = 500,
                StockMinimo = 100,
                Ubicacion = "Bodega 2 - Estante B1",
                Estado = "ACTIVO",
                FechaUltimoMovimiento = DateTime.Parse("2026-01-10"),
                Observaciones = "Botones de 4 agujeros, 15mm diámetro"
            },
            new Material
            {
                MaterialId = 6,
                Codigo = "PR-006",
                Nombre = "Cinta reflectiva",
                Categoria = "Insumo",
                UnidadMedida = "rollo",
                CantidadActual = 8,
                StockMinimo = 5,
                Ubicacion = "Bodega 2 - Estante C2",
                Estado = "ACTIVO",
                FechaUltimoMovimiento = DateTime.Parse("2026-01-25"),
                Observaciones = "Cinta reflectiva de alta visibilidad"
            },
            new Material
            {
                MaterialId = 7,
                Codigo = "PR-007",
                Nombre = "Vinil reflectivo",
                Categoria = "Insumo",
                UnidadMedida = "rollo",
                CantidadActual = 3,
                StockMinimo = 5,
                Ubicacion = "Bodega 2 - Estante C2",
                Estado = "BAJO_STOCK",
                FechaUltimoMovimiento = DateTime.Parse("2026-01-26"),
                Observaciones = "Vinil reflectivo para estampados"
            }
        );

        // Seed de movimientos iniciales
        modelBuilder.Entity<MovimientoInventario>().HasData(
            // Movimientos para PR-001: Tela deportiva dry fit jik
            new MovimientoInventario
            {
                MovimientoId = 1,
                MaterialId = 1,
                Tipo = "ENTRADA",
                Cantidad = 120,
                FechaMovimiento = DateTime.Parse("2026-01-10"),
                Descripcion = "Compra inicial de tela dry fit jik al proveedor TextilPro",
                EstadoAnterior = null,
                EstadoNuevo = "ACTIVO"
            },
            new MovimientoInventario
            {
                MovimientoId = 2,
                MaterialId = 1,
                Tipo = "SALIDA",
                Cantidad = 20,
                FechaMovimiento = DateTime.Parse("2026-01-15"),
                Descripcion = "Salida para producción de uniformes deportivos - Orden #1001",
                EstadoAnterior = null,
                EstadoNuevo = null
            },

            // Movimientos para PR-002: Tela deportiva dry fit cool plus
            new MovimientoInventario
            {
                MovimientoId = 3,
                MaterialId = 2,
                Tipo = "ENTRADA",
                Cantidad = 50,
                FechaMovimiento = DateTime.Parse("2026-01-05"),
                Descripcion = "Entrada inicial de tela cool plus",
                EstadoAnterior = null,
                EstadoNuevo = "ACTIVO"
            },
            new MovimientoInventario
            {
                MovimientoId = 4,
                MaterialId = 2,
                Tipo = "SALIDA",
                Cantidad = 50,
                FechaMovimiento = DateTime.Parse("2026-01-20"),
                Descripcion = "Salida completa para producción urgente - Orden #1015",
                EstadoAnterior = "ACTIVO",
                EstadoNuevo = "AGOTADO"
            },
            new MovimientoInventario
            {
                MovimientoId = 5,
                MaterialId = 2,
                Tipo = "CAMBIO_ESTADO",
                Cantidad = 0,
                FechaMovimiento = DateTime.Parse("2026-01-20"),
                Descripcion = "Material agotado - se requiere reposición urgente",
                EstadoAnterior = "ACTIVO",
                EstadoNuevo = "AGOTADO"
            },

            // Movimientos para PR-003: Tela licra negro
            new MovimientoInventario
            {
                MovimientoId = 6,
                MaterialId = 3,
                Tipo = "ENTRADA",
                Cantidad = 40,
                FechaMovimiento = DateTime.Parse("2026-01-12"),
                Descripcion = "Compra de tela licra negra",
                EstadoAnterior = null,
                EstadoNuevo = "ACTIVO"
            },
            new MovimientoInventario
            {
                MovimientoId = 7,
                MaterialId = 3,
                Tipo = "SALIDA",
                Cantidad = 25,
                FechaMovimiento = DateTime.Parse("2026-01-22"),
                Descripcion = "Salida para producción de leggings - Orden #1018",
                EstadoAnterior = "ACTIVO",
                EstadoNuevo = "BAJO_STOCK"
            },

            // Movimientos para PR-004: Tela algodón blanco
            new MovimientoInventario
            {
                MovimientoId = 8,
                MaterialId = 4,
                Tipo = "ENTRADA",
                Cantidad = 80,
                FechaMovimiento = DateTime.Parse("2026-01-08"),
                Descripcion = "Compra de tela de algodón blanco 100% natural",
                EstadoAnterior = null,
                EstadoNuevo = "ACTIVO"
            },
            new MovimientoInventario
            {
                MovimientoId = 9,
                MaterialId = 4,
                Tipo = "SALIDA",
                Cantidad = 20,
                FechaMovimiento = DateTime.Parse("2026-01-18"),
                Descripcion = "Salida para producción de camisetas básicas",
                EstadoAnterior = null,
                EstadoNuevo = null
            },

            // Movimientos para PR-005: Botones negro
            new MovimientoInventario
            {
                MovimientoId = 10,
                MaterialId = 5,
                Tipo = "ENTRADA",
                Cantidad = 1000,
                FechaMovimiento = DateTime.Parse("2026-01-05"),
                Descripcion = "Compra de botones negros 15mm",
                EstadoAnterior = null,
                EstadoNuevo = "ACTIVO"
            },
            new MovimientoInventario
            {
                MovimientoId = 11,
                MaterialId = 5,
                Tipo = "SALIDA",
                Cantidad = 500,
                FechaMovimiento = DateTime.Parse("2026-01-10"),
                Descripcion = "Salida para producción de camisas - múltiples órdenes",
                EstadoAnterior = null,
                EstadoNuevo = null
            },

            // Movimientos para PR-006: Cinta reflectiva
            new MovimientoInventario
            {
                MovimientoId = 12,
                MaterialId = 6,
                Tipo = "ENTRADA",
                Cantidad = 10,
                FechaMovimiento = DateTime.Parse("2026-01-20"),
                Descripcion = "Compra de rollos de cinta reflectiva",
                EstadoAnterior = null,
                EstadoNuevo = "ACTIVO"
            },
            new MovimientoInventario
            {
                MovimientoId = 13,
                MaterialId = 6,
                Tipo = "SALIDA",
                Cantidad = 2,
                FechaMovimiento = DateTime.Parse("2026-01-25"),
                Descripcion = "Salida para uniformes de seguridad industrial",
                EstadoAnterior = null,
                EstadoNuevo = null
            },

            // Movimientos para PR-007: Vinil reflectivo
            new MovimientoInventario
            {
                MovimientoId = 14,
                MaterialId = 7,
                Tipo = "ENTRADA",
                Cantidad = 8,
                FechaMovimiento = DateTime.Parse("2026-01-15"),
                Descripcion = "Entrada de rollos de vinil reflectivo",
                EstadoAnterior = null,
                EstadoNuevo = "ACTIVO"
            },
            new MovimientoInventario
            {
                MovimientoId = 15,
                MaterialId = 7,
                Tipo = "SALIDA",
                Cantidad = 5,
                FechaMovimiento = DateTime.Parse("2026-01-26"),
                Descripcion = "Salida para estampados reflectivos en chalecos",
                EstadoAnterior = "ACTIVO",
                EstadoNuevo = "BAJO_STOCK"
            },
            new MovimientoInventario
            {
                MovimientoId = 16,
                MaterialId = 7,
                Tipo = "CAMBIO_ESTADO",
                Cantidad = 0,
                FechaMovimiento = DateTime.Parse("2026-01-26"),
                Descripcion = "Stock bajo - se recomienda realizar pedido pronto",
                EstadoAnterior = "ACTIVO",
                EstadoNuevo = "BAJO_STOCK"
            }
        );
    }
}
