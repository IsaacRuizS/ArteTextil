using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using ArteTextil.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArteTextil.Business;

public class PaymentBusiness
{
    private readonly IRepositoryPayment _repository;
    private readonly ArteTextilDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ISystemLogHelper _logHelper;

    public PaymentBusiness(ArteTextilDbContext context, IEmailService emailService, ISystemLogHelper logHelper)
    {
        _context = context;
        _repository = new RepositoryPayment(context);
        _emailService = emailService;
        _logHelper = logHelper;
    }

    // Registrar pago
    public async Task<ApiResponse<PaymentDto>> Create(PaymentDto dto)
    {
        var response = new ApiResponse<PaymentDto>();

        try
        {
            if (dto.payrollId <= 0)
            {
                response.Success = false;
                response.Message = "Debe seleccionar una planilla válida";
                return response;
            }

            if (string.IsNullOrWhiteSpace(dto.method))
            {
                response.Success = false;
                response.Message = "Debe indicar el método de pago";
                return response;
            }

            var payroll = await _context.PayrollMonthly
                .FirstOrDefaultAsync(p => p.PayrollId == dto.payrollId && p.DeletedAt == null);

            if (payroll == null)
            {
                response.Success = false;
                response.Message = "Planilla no encontrada";
                return response;
            }

            // bloquear pago si la planilla ya fue pagada
            var exists = await _context.Payments
                .AnyAsync(p =>
                    p.PayrollId == dto.payrollId &&
                    p.DeletedAt == null);

            if (exists)
            {
                response.Success = false;
                response.Message = "Esta planilla ya fue pagada";
                return response;
            }

            var amount = dto.amount > 0 ? dto.amount : payroll.Total;

            if (amount <= 0)
            {
                response.Success = false;
                response.Message = "El monto del pago debe ser mayor que cero";
                return response;
            }

            var entity = new Payment
            {
                PayrollId = dto.payrollId,
                Amount = amount,
                Method = dto.method.Trim(),
                PaymentDate = dto.paymentDate == default ? DateTime.UtcNow : dto.paymentDate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Payments.AddAsync(entity);

            payroll.UpdatedAt = DateTime.UtcNow;

            await _context.Alerts.AddAsync(new Alert
            {
                Title = "Pago registrado",
                Message = $"Se registró un pago de planilla por ₡{amount:N2}.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            string? emailWarning = null;

            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserId == payroll.UserId && u.DeletedAt == null && u.IsActive);

                if (user != null)
                {
                    await _emailService.SendPayrollPaymentAsync(user, payroll, entity);
                }
                else
                {
                    emailWarning = "El pago fue registrado, pero no se pudo enviar el correo porque el usuario no existe o está inactivo.";
                }
            }
            catch (Exception emailEx)
            {
                emailWarning = $"El pago fue registrado, pero no se pudo enviar el correo: {emailEx.Message}";
            }

            if (!string.IsNullOrWhiteSpace(emailWarning))
            {
                await _logHelper.LogCreate(
                    "Email Payment",
                    entity.PayrollId,
                    emailWarning
                );
            }

            response.Data = new PaymentDto
            {
                payrollId = entity.PayrollId,
                amount = entity.Amount,
                method = entity.Method,
                paymentDate = entity.PaymentDate,
                isActive = entity.IsActive
            };
            response.Message = emailWarning ?? "Pago registrado y enviado por correo correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Ver pagos
    public async Task<ApiResponse<List<PaymentDto>>> GetAll()
    {
        var response = new ApiResponse<List<PaymentDto>>();

        try
        {
            var data = await _context.Payments
                .Where(p => p.DeletedAt == null)
                .Join(
                    _context.PayrollMonthly,
                    p => p.PayrollId,
                    pm => pm.PayrollId,
                    (p, pm) => new { p, pm }
                )
                .Join(
                    _context.Users,
                    x => x.pm.UserId,
                    u => u.UserId,
                    (x, u) => new PaymentDto
                    {
                        payrollId = x.p.PayrollId,
                        userName = u.FullName,
                        amount = x.p.Amount,
                        paymentDate = x.p.PaymentDate,
                        method = x.p.Method,
                        isActive = x.p.IsActive
                    }
                )
                .ToListAsync();

            response.Data = data;
            response.Message = "Pagos obtenidos";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }
}
