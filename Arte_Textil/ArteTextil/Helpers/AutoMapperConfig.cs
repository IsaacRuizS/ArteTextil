using ArteTextil.DTOs;
using ArteTextil.Data.Entities;
using AutoMapper;

namespace ArteTextil.Helpers
{
    public static class AutoMapperConfig
    {
        public static void Initialize(IMapperConfigurationExpression cfg)
        {

            cfg.CreateMap<Rol, RolDto>()
                .ForMember(dest => dest.roleId, src => src.MapFrom(i => i.RoleId));

            cfg.CreateMap<RolDto, Rol>()
                .ForMember(dest => dest.RoleId, src => src.MapFrom(i => i.roleId));

        }
    }
}
