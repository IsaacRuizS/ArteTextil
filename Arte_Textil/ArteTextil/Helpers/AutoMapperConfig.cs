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

            cfg.CreateMap<Supplier, SupplierDto>()
                .ForMember(dest => dest.supplierId, src => src.MapFrom(i => i.SupplierId));

            cfg.CreateMap<SupplierDto, Supplier>()
                .ForMember(dest => dest.SupplierId, src => src.MapFrom(i => i.supplierId));

            cfg.CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.productId, src => src.MapFrom(i => i.ProductId));

            cfg.CreateMap<ProductDto, Product>()
                .ForMember(dest => dest.ProductId, src => src.MapFrom(i => i.productId));

            cfg.CreateMap<ProductImage, ProductImageDto>()
                .ForMember(dest => dest.productImageId, src => src.MapFrom(i => i.ProductImageId));

            cfg.CreateMap<ProductImageDto, ProductImage>()
                .ForMember(dest => dest.ProductImageId, src => src.MapFrom(i => i.productImageId));

            cfg.CreateMap<Category, CategoryDto>()
                .ForMember(dest => dest.categoryId, src => src.MapFrom(i => i.CategoryId));

            cfg.CreateMap<CategoryDto, Category>()
                .ForMember(dest => dest.CategoryId, src => src.MapFrom(i => i.categoryId));

        }
    }
}
