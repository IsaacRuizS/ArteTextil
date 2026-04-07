using ArteTextil.Business;
using ArteTextil.Data;
using ArteTextil.Helpers;
using ArteTextil.Interfaces;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Hangfire;
using Hangfire.SqlServer;

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

// Program.cs
var connectionString =
    $"Data Source={Environment.GetEnvironmentVariable("DB_SERVER")};" +
    $"Initial Catalog={Environment.GetEnvironmentVariable("DB_NAME")};" +
    $"Persist Security Info=True;" +
    $"User ID={Environment.GetEnvironmentVariable("DB_USER")};" +
    $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")};" +
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
builder.Services.AddScoped<DemandBusiness>();
builder.Services.AddScoped<VacationBusiness>();
builder.Services.AddScoped<PayrollAdjustmentBusiness>();
builder.Services.AddScoped<PaymentBusiness>();
builder.Services.AddScoped<PayrollBusiness>();
builder.Services.AddScoped<SalaryBusiness>();
builder.Services.AddScoped<QuoteBusiness>();
builder.Services.AddScoped<CustomerBusiness>();
builder.Services.AddScoped<PromotionBusiness>();
builder.Services.AddScoped<BulkImportBusiness>();
builder.Services.AddScoped<AlertBusiness>();
builder.Services.AddScoped<CartBusiness>();
builder.Services.AddScoped<CartItemBusiness>();
builder.Services.AddScoped<OrderBusiness>();
builder.Services.AddScoped<ReportsBusiness>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<QuoteRandomNumber>();
builder.Services.AddScoped<IJobBusiness, JobBusiness>();
builder.Services.AddHostedService<DailyAlertsJobService>();

builder.Services.AddAuthorization(options =>
{
    // Solo roles 1 y 2 (Admin / Empleado). RoleId 3 = Customer queda excluido.
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("roleId", "1", "2"));

    // Reportes: roles 1 (Admin) y 4 (Analítica)
    options.AddPolicy("ReportsAccess", policy =>
        policy.RequireClaim("roleId", "1", "4"));

    options.AddPolicy("CustomerOnly", policy =>
        policy.RequireClaim("roleId", "3"));
});

builder.Services.AddControllers()
     .AddJsonOptions(options =>
     {
         options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
         options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
     });
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddHangfire(config =>
    config.UseSqlServerStorage(connectionString));

builder.Services.AddHangfireServer();

builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description  = "Ingresa tu token JWT. Ejemplo: eyJhbGci..."
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

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
