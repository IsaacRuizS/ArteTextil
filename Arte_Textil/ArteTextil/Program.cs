using ArteTextil;
using ArteTextil.Business;
using ArteTextil.Helpers;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

Env.Load();

var server = Env.GetString("DB_SERVER");
var database = Env.GetString("DB_NAME");
var user = Env.GetString("DB_USER");
var password = Env.GetString("DB_PASSWORD");

var connectionString =
    $"Server={server};" +
    $"Database={database};" +
    $"User Id={user};" +
    $"Password={password};" +
    $"TrustServerCertificate=True;";

// Agregar servicios al contenedor
builder.Services.AddDbContext<ArteTextilDbContext>(options =>
    options.UseSqlServer(connectionString));

// AutoMapper
builder.Services.AddAutoMapper(cfg =>
{
    AutoMapperConfig.Initialize(cfg);
});


//agregar entidades
builder.Services.AddScoped<RolBusiness>();

// Agregar servicios de controladores y Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); 

var app = builder.Build();

// Configuración del pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// NO usamos Auth todavía
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();
