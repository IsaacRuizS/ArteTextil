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
                    continue;

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
                        messages.Add($"Planilla ya pagada para {user.FullName}");
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
                    response.Message = "Payroll generado correctamente";
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
                response.Message = "Payroll generado correctamente";
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
            response.Message = "Payroll obtenido";
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
                response.Message = "Payroll no encontrado";
                return response;
            }

            payroll.ApprovedByUserId = adminId;
            payroll.UpdatedAt = DateTime.UtcNow;

            _repository.Update(payroll);
            await _repository.SaveAsync();

            response.Data = true;
            response.Message = "Payroll aprobado";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }
}