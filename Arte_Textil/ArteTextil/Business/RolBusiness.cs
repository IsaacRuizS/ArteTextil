using ArteTextil.DTOs;
using ArteTextil.Entities;
using ArteTextil.Helpers;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace ArteTextil.Business
{
    public class RolBusiness
    {
        private readonly ArteTextilDbContext _context;
        private readonly IMapper _mapper;

        public RolBusiness(ArteTextilDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ApiResponse<List<RolDto>>> GetAll()
        {
            var response = new ApiResponse<List<RolDto>>();

            try
            {
                var roles = await _context.Roles.ToListAsync();
                response.Data = _mapper.Map<List<RolDto>>(roles);
                response.Message = "Roles obtenidos correctamente";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error al obtener roles: {ex.Message}";
            }

            return response;
        }
    }
}
