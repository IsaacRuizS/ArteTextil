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

    // Ver salarios (CON SEGURIDAD)
    public async Task<ApiResponse<List<SalaryDto>>> GetAll(int userId, string roleId)
    {
        var response = new ApiResponse<List<SalaryDto>>();

        try
        {
            var query = _repository.Query()
                .Where(s => s.IsActive);

            // Si NO es admin, solo ve su salario
            if (roleId != "1")
            {
                query = query.Where(s => s.UserId == userId);
            }

            var data = query
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

    // Actualizar salario
    public async Task<ApiResponse<SalaryDto>> Update(int id, SalaryDto dto)
    {
        var response = new ApiResponse<SalaryDto>();

        try
        {
            var salary = await _repository.FirstOrDefaultAsync(x =>
                x.SalaryId == id &&
                x.DeletedAt == null);

            if (salary == null)
            {
                response.Success = false;
                response.Message = "Salario no encontrado";
                return response;
            }

            salary.UserId = dto.userId;
            salary.BaseSalary = dto.baseSalary;
            salary.UpdatedAt = DateTime.UtcNow;

            _repository.Update(salary);
            await _repository.SaveAsync();

            response.Data = _mapper.Map<SalaryDto>(salary);
            response.Message = "Salario actualizado";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }
}