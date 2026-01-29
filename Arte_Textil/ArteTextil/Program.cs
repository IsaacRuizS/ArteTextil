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
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configuración para base de datos en línea
var server = "sql.bsite.net\\MSSQL2016";
var database = "artetextil_";
var username = "artetextil_";
var password = "artetextil2026";

var connectionString =
    $"Server={server};" +
    $"Database={database};" +
    $"User Id={username};" +
    $"Password={password};" +
    $"Encrypt=True;" +
    $"TrustServerCertificate=True;" +
    $"MultipleActiveResultSets=True;";


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
builder.Services.AddScoped<ProductBusiness>();
builder.Services.AddScoped<SupplierBusiness>();
builder.Services.AddScoped<CategoryBusiness>();

// Agregar servicios de controladores y Swagger
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configuraci�n del pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
// uso del CORS aqu�
app.UseCors(corsPolicy);

// NO usamos Auth todav�a
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();
