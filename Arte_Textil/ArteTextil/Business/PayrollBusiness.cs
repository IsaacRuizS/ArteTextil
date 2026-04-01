using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using ArteTextil.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace ArteTextil.Business;

public class PayrollBusiness
{
    private readonly ArteTextilDbContext _context;
    private readonly IRepositoryPayrollMonthly _repository;
    private readonly IEmailService _emailService;

    public PayrollBusiness(ArteTextilDbContext context, IEmailService emailService)
    {
        _context = context;
        _repository = new RepositoryPayrollMonthly(context);
        _emailService = emailService;
    }


    // Generar planilla del mes
    public async Task<ApiResponse<bool>> GeneratePayroll(int year, int month)
    {
        var response = new ApiResponse<bool>();
        var messages = new List<string>();

        try
        {
            var users = await _context.Users
                .Where(u => u.DeletedAt == null)
                .ToListAsync();

            foreach (var user in users)
            {

                var salary = await _context.Salaries
                    .FirstOrDefaultAsync(s =>
                        s.UserId == user.UserId &&
                        s.IsActive);

                if (salary == null)
                {
                    messages.Add($"El usuario {user.FullName} no tiene salario asignado.");
                    continue;
                }

                var existingPayroll = await _context.PayrollMonthly
    .FirstOrDefaultAsync(p =>
        p.UserId == user.UserId &&
        p.Year == year &&
        p.Month == month &&
        p.DeletedAt == null);

                PayrollMonthly payroll;

                if (existingPayroll != null)
                {
                    var isPaid = await _context.Payments
                        .AnyAsync(p =>
                            p.PayrollId == existingPayroll.PayrollId &&
                            p.DeletedAt == null);

                    if (isPaid)
                    {
                        messages.Add($"La planilla de {user.FullName} ya fue pagada y no fue modificada.");
                        continue;
                    }

                    payroll = existingPayroll;
                }
                else
                {
                    payroll = new PayrollMonthly
                    {
                        UserId = user.UserId,
                        Year = year,
                        Month = month,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _context.PayrollMonthly.AddAsync(payroll);
                }

                await _context.SaveChangesAsync();

                if (messages.Any())
                {
                    response.Success = false;
                    response.Message = string.Join(" | ", messages);
                }
                else
                {
                    response.Data = true;
                    response.Message = "Las planillas fueron generadas correctamente.";
                }


                // SOLO ajustes NO aplicados
                var adjustments = await _context.PayrollAdjustments
    .Where(a =>
        a.UserId == user.UserId &&
        a.Year == year &&
        a.Month == month &&
        a.DeletedAt == null &&
        !a.Applied)
    .ToListAsync();

                decimal extras = adjustments
                    .Where(a => a.Type.Trim().ToLower() == "extra")
                    .Sum(a => a.Amount);

                decimal deductions = adjustments
                    .Where(a => a.Type.Trim().ToLower() == "rebajo")
                    .Sum(a => a.Amount);

                decimal total = salary.BaseSalary + extras - deductions;

                payroll.BaseSalary = salary.BaseSalary;
                payroll.Extras = extras;
                payroll.Deductions = deductions;
                payroll.Total = total;
                payroll.IsActive = true;
                payroll.UpdatedAt = DateTime.UtcNow;

                // MARCAR ajustes como usados
                foreach (var adj in adjustments)
                {
                    adj.Applied = true;
                    adj.UpdatedAt = DateTime.UtcNow;
                }

            }

            // Guardar cambios y finalizar transacción
            await _context.SaveChangesAsync();

            // Respuesta final
            if (messages.Any())
            {
                response.Success = false;
                response.Message = string.Join(" | ", messages);
            }
            else
            {
                response.Data = true;
                response.Message = "Planilla generado correctamente";
            }
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }


    // Ver planillas generadas
    public async Task<ApiResponse<List<PayrollMonthlyDto>>> GetAll()
    {
        var response = new ApiResponse<List<PayrollMonthlyDto>>();

        try
        {
            var data = await _context.PayrollMonthly
                .Where(p => p.DeletedAt == null)
                .Join(
                    _context.Users,
                    p => p.UserId,
                    u => u.UserId,
                    (p, u) => new PayrollMonthlyDto
                    {
                        payrollId = p.PayrollId,
                        userId = p.UserId,
                        userName = u.FullName,
                        year = p.Year,
                        month = p.Month,
                        baseSalary = p.BaseSalary,
                        extras = p.Extras,
                        deductions = p.Deductions,
                        total = p.Total,
                        approvedByUserId = p.ApprovedByUserId,
                        isActive = p.IsActive
                    }
                ).ToListAsync();

            response.Data = data;
            response.Message = "Planilla obtenida";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Aprobar planillas
    public async Task<ApiResponse<bool>> Approve(int payrollId, int adminId)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var payroll = await _repository.GetByIdAsync(payrollId);

            if (payroll == null)
            {
                response.Success = false;
                response.Message = "Planilla no encontrada";
                return response;
            }

            payroll.ApprovedByUserId = adminId;
            payroll.UpdatedAt = DateTime.UtcNow;

            _repository.Update(payroll);
            await _repository.SaveAsync();

            response.Data = true;
            response.Message = "Planilla aprobada";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    public async Task<ApiResponse<bool>> ProcessPayroll(int payrollId, int adminId, string method)
    {
        var response = new ApiResponse<bool>();

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var payroll = await _context.PayrollMonthly
                .FirstOrDefaultAsync(p =>
                    p.PayrollId == payrollId &&
                    p.DeletedAt == null);

            if (payroll == null)
            {
                response.Success = false;
                response.Message = "Planilla no encontrada";
                return response;
            }

            // Verificar si ya está pagada
            var alreadyPaid = await _context.Payments
                .AnyAsync(p =>
                    p.PayrollId == payrollId &&
                    p.DeletedAt == null);

            if (alreadyPaid)
            {
                response.Success = false;
                response.Message = "La planilla ya había sido pagada previamente.";
                return response;
            }

            // Aprobar
            payroll.ApprovedByUserId = adminId;
            payroll.UpdatedAt = DateTime.UtcNow;

            // Crear pago
            var payment = new Payment
            {
                PayrollId = payrollId,
                Amount = payroll.Total,
                Method = method,
                PaymentDate = DateTime.UtcNow,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Payments.AddAsync(payment);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // EMAIL
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserId == payroll.UserId);

                if (user != null)
                {
                    await _emailService.SendPayrollPaymentAsync(user, payroll, payment);
                }
            }
            catch (Exception emailEx)
            {
                //
                Console.WriteLine("Error enviando correo: " + emailEx.Message);
            }

            response.Data = true;
            response.Message = "La planilla fue procesada y pagada correctamente.";
        }
        catch (Exception ex)
        {
            if (transaction.GetDbTransaction().Connection != null)
            {
                await transaction.RollbackAsync();
            }

            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }
}