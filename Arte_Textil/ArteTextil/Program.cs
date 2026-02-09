using ArteTextil.Data;
using ArteTextil.Business;
using ArteTextil.Helpers;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var corsPolicy = "AllowFrontend";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicy, policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

Env.Load();

var server = Env.GetString("DB_SERVER");
var database = Env.GetString("DB_NAME");
var user = Env.GetString("DB_USER");
var password = Env.GetString("DB_PASSWORD");

var connectionString =
    $"Data Source={server};" +
    $"Initial Catalog={database};" +
    $"Persist Security Info=True;" +
    $"User ID={user};" +
    $"Password={password};" +
    $"Pooling=False;" +
    $"MultipleActiveResultSets=False;" +
    $"Encrypt=True;" +
    $"TrustServerCertificate=True;" +
    $"Application Name=\"ArteTextilApp\";" +
    $"Command Timeout=30;";


// Agregar servicios al contenedor
builder.Services.AddDbContext<ArteTextilDbContext>(options =>
    options.UseSqlServer(connectionString));

// AutoMapper
builder.Services.AddAutoMapper(cfg =>
{
    AutoMapperConfig.Initialize(cfg);
});

builder.Services.AddScoped<ISystemLogHelper, SystemLogHelper>();

//agregar entidades
builder.Services.AddScoped<RolBusiness>();
builder.Services.AddScoped<UserBusiness>();
builder.Services.AddScoped<ProductBusiness>();
builder.Services.AddScoped<SupplierBusiness>();
builder.Services.AddScoped<CategoryBusiness>();

// Inventario: Siempre usar datos reales de la base de datos
builder.Services.AddScoped<InventoryBusiness>();
Console.WriteLine("📦 Inventario: Usando Base de Datos real");

// Agregar servicios de controladores y Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configuraci�n del pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
// uso del CORS aqu�
app.UseCors(corsPolicy);

// NO usamos Auth todav�a
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();
