using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using Microsoft.EntityFrameworkCore;

namespace ArteTextil.Business;

public class PayrollBusiness
{
    private readonly ArteTextilDbContext _context;
    private readonly IRepositoryPayrollMonthly _repository;

    public PayrollBusiness(ArteTextilDbContext context)
    {
        _context = context;
        _repository = new RepositoryPayrollMonthly(context);
    }


    // Generar planilla del mes
    public async Task<ApiResponse<bool>> GeneratePayroll(int year, int month)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var users = await _context.Users
                .Where(u => u.DeletedAt == null)
                .ToListAsync();

            foreach (var user in users)
            {
                // Verificar si YA existe payroll para este usuario en este mes
                var payrollExists = await _context.PayrollMonthly
                    .AnyAsync(p =>
                        p.UserId == user.UserId &&
                        p.Year == year &&
                        p.Month == month &&
                        p.DeletedAt == null);

                if (payrollExists)
                    continue; // saltar usuario (evita duplicado)

                var salary = await _context.Salaries
                    .Where(s => s.UserId == user.UserId && s.IsActive)
                    .FirstOrDefaultAsync();

                if (salary == null)
                    continue;

                var adjustments = await _context.PayrollAdjustments
                    .Where(a =>
                        a.UserId == user.UserId &&
                        a.DeletedAt == null)
                    .ToListAsync();

                decimal extras = adjustments
                    .Where(a => a.Type == "Extra")
                    .Sum(a => a.Amount);

                decimal deductions = adjustments
                    .Where(a => a.Type == "Rebajo")
                    .Sum(a => a.Amount);

                decimal total =
                    salary.BaseSalary +
                    extras -
                    deductions;
        

                var payroll = new PayrollMonthly
                {
                    UserId = user.UserId,
                    Year = year,
                    Month = month,
                    BaseSalary = salary.BaseSalary,
                    Extras = extras,
                    Deductions = deductions,
                    Total = total,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.PayrollMonthly.AddAsync(payroll);
            }

            await _context.SaveChangesAsync();

            response.Data = true;
            response.Message = "Payroll generado correctamente";
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