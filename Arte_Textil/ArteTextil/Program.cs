using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using ArteTextil.Models;

var builder = WebApplication.CreateBuilder(args);

Env.Load();

var server = Env.GetString("DB_SERVER");
var database = Env.GetString("DB_NAME");
var user = Env.GetString("DB_USER");
var password = Env.GetString("DB_PASSWORD");
var trustCert = Env.GetString("DB_TRUST_CERT");

var connectionString =
    $"Server={server};" +
    $"Database={database};" +
    $"User Id={user};" +
    $"Password={password};";

// Agregar servicios al contenedor
builder.Services.AddDbContext<ArteTextilDbContext>(options =>
    options.UseSqlServer(connectionString));
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
