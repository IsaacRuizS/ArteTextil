using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;

namespace ArteTextil.Business;

public class SalaryBusiness
{
    private readonly IRepositorySalary _repository;
    private readonly IMapper _mapper;

    public SalaryBusiness(
        ArteTextilDbContext context,
        IMapper mapper)
    {
        _repository = new RepositorySalary(context);
        _mapper = mapper;
    }

    // Crear salario
    public async Task<ApiResponse<SalaryDto>> Create(SalaryDto dto)
    {
        var response = new ApiResponse<SalaryDto>();

        try
        {
            var entity = new Salary
            {
                UserId = dto.userId,
                BaseSalary = dto.baseSalary,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(entity);

            response.Data = new SalaryDto
            {
                salaryId = entity.SalaryId,
                userId = entity.UserId,
                baseSalary = entity.BaseSalary,
                isActive = entity.IsActive
            };

            response.Message = "Salario creado";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Ver salarios
    public async Task<ApiResponse<List<SalaryDto>>> GetAll()
    {
        var response = new ApiResponse<List<SalaryDto>>();

        try
        {
            var data = _repository.Query()
                .Where(s => s.IsActive)
                .Join(
                    _repository.Context.Users,
                    s => s.UserId,
                    u => u.UserId,
                    (s, u) => new SalaryDto
                    {
                        salaryId = s.SalaryId,
                        userId = s.UserId,
                        userName = u.FullName,
                        baseSalary = s.BaseSalary,
                        isActive = s.IsActive
                    }
                ).ToList();

            response.Data = data;
            response.Message = "Salarios obtenidos";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }
}