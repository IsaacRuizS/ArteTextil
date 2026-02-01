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

            cfg.CreateMap<User, UserDto>()
                .ForMember(dest => dest.userId, src => src.MapFrom(i => i.UserId));

            cfg.CreateMap<UserDto, User>()
                .ForMember(dest => dest.UserId, src => src.MapFrom(i => i.userId));

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

            cfg.CreateMap<InventoryMovement, InventoryMovementDto>()
                .ForMember(dest => dest.movementId, src => src.MapFrom(i => i.MovementId))
                .ForMember(dest => dest.productId, src => src.MapFrom(i => i.ProductId))
                .ForMember(dest => dest.type, src => src.MapFrom(i => i.Type))
                .ForMember(dest => dest.quantity, src => src.MapFrom(i => i.Quantity))
                .ForMember(dest => dest.reason, src => src.MapFrom(i => i.Reason))
                .ForMember(dest => dest.previousStock, src => src.MapFrom(i => i.PreviousStock))
                .ForMember(dest => dest.newStock, src => src.MapFrom(i => i.NewStock))
                .ForMember(dest => dest.performedByUserId, src => src.MapFrom(i => i.PerformedByUserId))
                .ForMember(dest => dest.isActive, src => src.MapFrom(i => i.IsActive));

            cfg.CreateMap<InventoryMovementDto, InventoryMovement>()
                .ForMember(dest => dest.MovementId, src => src.MapFrom(i => i.movementId))
                .ForMember(dest => dest.ProductId, src => src.MapFrom(i => i.productId))
                .ForMember(dest => dest.Type, src => src.MapFrom(i => i.type))
                .ForMember(dest => dest.Quantity, src => src.MapFrom(i => i.quantity))
                .ForMember(dest => dest.Reason, src => src.MapFrom(i => i.reason))
                .ForMember(dest => dest.PreviousStock, src => src.MapFrom(i => i.previousStock))
                .ForMember(dest => dest.NewStock, src => src.MapFrom(i => i.newStock))
                .ForMember(dest => dest.PerformedByUserId, src => src.MapFrom(i => i.performedByUserId))
                .ForMember(dest => dest.IsActive, src => src.MapFrom(i => i.isActive));

        }
    }
}
