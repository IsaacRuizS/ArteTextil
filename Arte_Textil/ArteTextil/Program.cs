using ArteTextil.Business;
using ArteTextil.Data;
using ArteTextil.Helpers;
using ArteTextil.Interfaces;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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

var server   = Env.GetString("DB_SERVER");
var database = Env.GetString("DB_NAME");
var user     = Env.GetString("DB_USER");
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

builder.Services.AddDbContext<ArteTextilDbContext>(options =>
    options.UseSqlServer(connectionString));

// AutoMapper
builder.Services.AddAutoMapper(cfg =>
{
    AutoMapperConfig.Initialize(cfg);
});

builder.Services.AddScoped<ISystemLogHelper, SystemLogHelper>();

// Entidades
builder.Services.AddScoped<RolBusiness>();
builder.Services.AddScoped<UserBusiness>();
builder.Services.AddScoped<ProductBusiness>();
builder.Services.AddScoped<SupplierBusiness>();
builder.Services.AddScoped<CategoryBusiness>();
builder.Services.AddScoped<AttendanceBusiness>();
builder.Services.AddScoped<VacationBusiness>();
builder.Services.AddScoped<PayrollAdjustmentBusiness>();
builder.Services.AddScoped<QuoteBusiness>();
builder.Services.AddScoped<CustomerBusiness>();
builder.Services.AddScoped<PromotionBusiness>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<JwtHelper>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ClockSkew                = TimeSpan.Zero,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(corsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
