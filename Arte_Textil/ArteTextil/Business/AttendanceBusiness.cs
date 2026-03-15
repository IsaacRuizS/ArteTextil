using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.DTOs;
using ArteTextil.Helpers;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ArteTextil.Business;

public class AttendanceBusiness
{
    private readonly IRepositoryAttendance _repository;
    private readonly IMapper _mapper;
    private readonly ISystemLogHelper _logHelper;
    private readonly ArteTextilDbContext _context;

    public AttendanceBusiness(
    ArteTextilDbContext context,
    IMapper mapper,
    ISystemLogHelper logHelper)
    {
        _context = context;
        _repository = new RepositoryAttendance(context);
        _mapper = mapper;
        _logHelper = logHelper;
    }

    // Check-in
    public async Task<ApiResponse<bool>> CheckIn(int userId)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var today = DateTime.UtcNow.Date;

            var existing = await _repository.FirstOrDefaultAsync(a =>
                a.UserId == userId &&
                a.CheckIn != null &&
                a.CheckIn.Value.Date == today &&
                a.DeletedAt == null);

            if (existing != null)
            {
                response.Success = false;
                response.Message = "Ya existe un check-in hoy";
                return response;
            }

            var attendance = new Attendance
            {
                UserId = userId,
                CheckIn = DateTime.UtcNow,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(attendance);

            await _logHelper.LogCreate(
                "Attendance",
                attendance.AttendanceId,
                JsonSerializer.Serialize(attendance)
            );

            response.Data = true;
            response.Message = "Check-in registrado correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Check-out
    public async Task<ApiResponse<bool>> CheckOut(int userId)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var today = DateTime.UtcNow.Date;

            var attendance = await _repository.FirstOrDefaultAsync(a =>
                a.UserId == userId &&
                a.CheckIn != null &&
                a.CheckIn.Value.Date == today &&
                a.CheckOut == null &&
                a.DeletedAt == null);

            if (attendance == null)
            {
                response.Success = false;
                response.Message = "No existe check-in para hoy";
                return response;
            }

            var previous = JsonSerializer.Serialize(attendance);

            attendance.CheckOut = DateTime.UtcNow;
            attendance.UpdatedAt = DateTime.UtcNow;

            _repository.Update(attendance);
            await _repository.SaveAsync();

            await _logHelper.LogUpdate(
                "Attendance",
                attendance.AttendanceId,
                previous,
                JsonSerializer.Serialize(attendance)
            );

            response.Data = true;
            response.Message = "Check-out registrado correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Ver asistencias

    public async Task<ApiResponse<List<AttendanceDto>>> GetAll()
    {
        var response = new ApiResponse<List<AttendanceDto>>();

        try
        {
            var data = await _context.Attendance
                .Where(a => a.DeletedAt == null)
                .Select(a => new AttendanceDto
                {
                    attendanceId = a.AttendanceId,
                    userId = a.UserId,
                    userName = _context.Users
                        .Where(u => u.UserId == a.UserId)
                        .Select(u => u.FullName)
                        .FirstOrDefault(),

                    checkIn = a.CheckIn,
                    checkOut = a.CheckOut,
                    isActive = a.IsActive
                })
                .ToListAsync();

            response.Data = data;
            response.Message = "Asistencias obtenidas correctamente";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Registrar asistencias administrador

    public async Task<ApiResponse<AttendanceDto>> CreateForUser(AttendanceDto dto)
    {
        var response = new ApiResponse<AttendanceDto>();

        try
        {
            var attendance = new Attendance
            {
                UserId = dto.userId,
                CheckIn = dto.checkIn,
                CheckOut = dto.checkOut,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(attendance);

            response.Data = _mapper.Map<AttendanceDto>(attendance);
            response.Message = "Asistencia registrada por administrador";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }

    // Editar asistencias administrador

    public async Task<ApiResponse<bool>> Update(int id, AttendanceDto dto)
    {
        var response = new ApiResponse<bool>();

        try
        {
            var attendance = await _repository.GetByIdAsync(id);

            if (attendance == null)
            {
                response.Success = false;
                response.Message = "Asistencia no encontrada";
                return response;
            }

            attendance.CheckIn = dto.checkIn;
            attendance.CheckOut = dto.checkOut;
            attendance.UpdatedAt = DateTime.UtcNow;

            _repository.Update(attendance);
            await _repository.SaveAsync();

            response.Data = true;
            response.Message = "Asistencia actualizada";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
        }

        return response;
    }
}

