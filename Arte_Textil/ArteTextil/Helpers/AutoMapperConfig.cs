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
                .ForMember(d => d.vacationRequestId, o => o.MapFrom(s => s.VacationId))
                .ForMember(d => d.notes, o => o.MapFrom(s => s.Notes));

            cfg.CreateMap<VacationRequestDto, Vacation>()
                .ForMember(d => d.VacationId, o => o.MapFrom(s => s.vacationRequestId))
                .ForMember(d => d.Notes, o => o.MapFrom(s => s.notes));

            cfg.CreateMap<Salary, SalaryDto>().ReverseMap();

            cfg.CreateMap<PayrollMonthly, PayrollMonthlyDto>().ReverseMap();

            cfg.CreateMap<Payment, PaymentDto>().ReverseMap();

            cfg.CreateMap<PayrollAdjustment, PayrollAdjustmentDto>()
                .ForMember(d => d.adjustmentId, o => o.MapFrom(s => s.AdjustmentId));

            cfg.CreateMap<PayrollAdjustmentDto, PayrollAdjustment>()
                .ForMember(d => d.AdjustmentId, o => o.MapFrom(s => s.adjustmentId));

            cfg.CreateMap<Promotion, PromotionDto>()
               .ForMember(d => d.promotionId, o => o.MapFrom(s => s.PromotionId))
               .ForMember(d => d.productId, o => o.MapFrom(s => s.ProductId))
               .ForMember(d => d.productName, o => o.MapFrom(s => s.Product != null ? s.Product.Name : null));

            cfg.CreateMap<PromotionDto, Promotion>()
                .ForMember(d => d.PromotionId, o => o.MapFrom(s => s.promotionId))
                .ForMember(d => d.Product, o => o.Ignore());

            cfg.CreateMap<Quote, QuoteDto>()
               .ForMember(d => d.quoteId, o => o.MapFrom(s => s.QuoteId))
               .ForMember(d => d.items, o => o.MapFrom(s => s.QuoteItems));

            cfg.CreateMap<QuoteDto, Quote>()
               .ForMember(d => d.QuoteId, o => o.MapFrom(s => s.quoteId))
               .ForMember(d => d.QuoteItems, o => o.MapFrom(s => s.items));

            cfg.CreateMap<QuoteItem, QuoteItemDto>()
                .ForMember(d => d.quoteItemId, o => o.MapFrom(s => s.QuoteItemId));

            cfg.CreateMap<QuoteItemDto, QuoteItem>()
                .ForMember(d => d.QuoteItemId, o => o.MapFrom(s => s.quoteItemId));

            cfg.CreateMap<Customer, CustomerDto>()
                .ForMember(d => d.customerId, o => o.MapFrom(s => s.CustomerId));

            cfg.CreateMap<CustomerDto, Customer>()
                .ForMember(d => d.CustomerId, o => o.MapFrom(s => s.customerId));

            cfg.CreateMap<Cart, CartDto>()
                .ForMember(d => d.cartId, o => o.MapFrom(s => s.CartId));

            cfg.CreateMap<CartDto, Cart>()
                .ForMember(d => d.CartId, o => o.MapFrom(s => s.cartId));

            cfg.CreateMap<CartItem, CartItemDto>()
                .ForMember(d => d.cartItemId, o => o.MapFrom(s => s.CartItemId));

            cfg.CreateMap<CartItemDto, CartItem>()
                .ForMember(d => d.CartItemId, o => o.MapFrom(s => s.cartItemId));

            cfg.CreateMap<Order, OrderDto>()
                .ForMember(d => d.orderId, o => o.MapFrom(s => s.OrderId))
                .ForMember(d => d.items, o => o.MapFrom(s => s.OrderItems))
                .ForMember(d => d.customerId, o => o.MapFrom(s => s.CustomerId))
                .ForMember(d => d.quoteId, o => o.MapFrom(s => s.QuoteId));

            cfg.CreateMap<OrderDto, Order>()
                .ForMember(d => d.OrderId, o => o.MapFrom(s => s.orderId));

            cfg.CreateMap<OrderItem, OrderItemDto>()
            .ForMember(d => d.orderItemId, o => o.MapFrom(s => s.OrderItemId));

            cfg.CreateMap<OrderItemDto, OrderItem>()
                .ForMember(d => d.OrderItemId, o => o.MapFrom(s => s.orderItemId));

            cfg.CreateMap<OrderStatusHistory, OrderStatusHistoryDto>()
            .ForMember(d => d.orderStatusHistoryId, o => o.MapFrom(s => s.OrderStatusHistoryId));

            cfg.CreateMap<OrderStatusHistoryDto, OrderStatusHistory>()
                .ForMember(d => d.OrderStatusHistoryId, o => o.MapFrom(s => s.orderStatusHistoryId));

            cfg.CreateMap<Alert, AlertDto>()
            .ForMember(d => d.alertId, o => o.MapFrom(s => s.AlertId));

            cfg.CreateMap<AlertDto, Alert>()
                .ForMember(d => d.AlertId, o => o.MapFrom(s => s.alertId));
        }
    }
}
