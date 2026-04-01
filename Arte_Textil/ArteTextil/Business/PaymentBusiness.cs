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

            var entity = new Payment
            {
                PayrollId = dto.payrollId,
                Amount = dto.amount,
                Method = dto.method,
                PaymentDate = dto.paymentDate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Payments.AddAsync(entity);

            await _context.SaveChangesAsync();

            response.Data = dto;
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