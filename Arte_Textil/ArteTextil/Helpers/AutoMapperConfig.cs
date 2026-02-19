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
                .ForMember(dest => dest.userId, src => src.MapFrom(i => i.UserId))
                .ForMember(dest => dest.passwordHash, src => src.Ignore());

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

            cfg.CreateMap<Attendance, AttendanceDto>()
                .ForMember(d => d.attendanceId, o => o.MapFrom(s => s.AttendanceId))
                .ForMember(d => d.userId, o => o.MapFrom(s => s.UserId))
                .ForMember(d => d.checkIn, o => o.MapFrom(s => s.CheckIn))
                .ForMember(d => d.checkOut, o => o.MapFrom(s => s.CheckOut))
                .ForMember(d => d.isActive, o => o.MapFrom(s => s.IsActive));

            cfg.CreateMap<AttendanceDto, Attendance>()
                .ForMember(d => d.AttendanceId, o => o.MapFrom(s => s.attendanceId))
                .ForMember(d => d.UserId, o => o.MapFrom(s => s.userId))
                .ForMember(d => d.CheckIn, o => o.MapFrom(s => s.checkIn))
                .ForMember(d => d.CheckOut, o => o.MapFrom(s => s.checkOut))
                .ForMember(d => d.IsActive, o => o.MapFrom(s => s.isActive));

            cfg.CreateMap<Vacation, VacationRequestDto>()
                .ForMember(d => d.vacationRequestId, o => o.MapFrom(s => s.VacationId));

            cfg.CreateMap<VacationRequestDto, Vacation>()
                .ForMember(d => d.VacationId, o => o.MapFrom(s => s.vacationRequestId));

            cfg.CreateMap<PayrollAdjustment, PayrollAdjustmentDto>()
                .ForMember(d => d.adjustmentId, o => o.MapFrom(s => s.AdjustmentId));

            cfg.CreateMap<PayrollAdjustmentDto, PayrollAdjustment>()
                .ForMember(d => d.AdjustmentId, o => o.MapFrom(s => s.adjustmentId));

            cfg.CreateMap<Promotion, PromotionDto>()
               .ForMember(d => d.promotionId, o => o.MapFrom(s => s.PromotionId));

            cfg.CreateMap<PromotionDto, Promotion>()
                .ForMember(d => d.PromotionId, o => o.MapFrom(s => s.promotionId));

            cfg.CreateMap<Quote, QuoteDto>()
                .ForMember(d => d.quoteId, o => o.MapFrom(s => s.QuoteId));

            cfg.CreateMap<QuoteDto, Quote>()
                .ForMember(d => d.QuoteId, o => o.MapFrom(s => s.quoteId));

            cfg.CreateMap<QuoteItem, QuoteItemDto>()
                .ForMember(d => d.quoteItemId, o => o.MapFrom(s => s.QuoteItemId));

            cfg.CreateMap<QuoteItemDto, QuoteItem>()
                .ForMember(d => d.QuoteItemId, o => o.MapFrom(s => s.quoteItemId));

            cfg.CreateMap<Customer, CustomerDto>()
                .ForMember(d => d.customerId, o => o.MapFrom(s => s.CustomerId));

            cfg.CreateMap<CustomerDto, Customer>()
                .ForMember(d => d.CustomerId, o => o.MapFrom(s => s.customerId));

        }
    }
}
