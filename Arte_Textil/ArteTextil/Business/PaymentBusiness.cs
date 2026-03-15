using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using Microsoft.EntityFrameworkCore;

namespace ArteTextil.Business;

public class PaymentBusiness
{
    private readonly IRepositoryPayment _repository;
    private readonly ArteTextilDbContext _context;

    public PaymentBusiness(ArteTextilDbContext context)
    {
        _context = context;
        _repository = new RepositoryPayment(context);
    }

    // Registrar pago
    public async Task<ApiResponse<PaymentDto>> Create(PaymentDto dto)
    {
        var response = new ApiResponse<PaymentDto>();

        try
        {
            var payroll = await _context.PayrollMonthly
                .FirstOrDefaultAsync(p => p.PayrollId == dto.payrollId);

            if (payroll == null)
            {
                response.Success = false;
                response.Message = "Payroll no encontrado";
                return response;
            }

            var payment = new Payment
            {
                PayrollId = dto.payrollId,
                Amount = payroll.Total,
                PaymentDate = DateTime.UtcNow,
                Method = dto.method,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(payment);

            response.Data = new PaymentDto
            {
                paymentId = payment.PaymentId,
                payrollId = payment.PayrollId,
                amount = payment.Amount,
                paymentDate = payment.PaymentDate,
                method = payment.Method,
                isActive = payment.IsActive
            };

            response.Message = "Pago registrado correctamente";
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
                        paymentId = x.p.PaymentId,
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