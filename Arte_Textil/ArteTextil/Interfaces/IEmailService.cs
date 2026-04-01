using ArteTextil.Data.Entities;

namespace ArteTextil.Interfaces
{
    public interface IEmailService
    {
        Task SendQuoteCreatedAsync(Quote quote, Customer customer);
        Task SendRegistrationConfirmationAsync(string fullName, string email);
        Task SendPromotionsExpiringAsync(List<string>? emails, List<Promotion> promotions);
        Task SendDailyAlertsToAdminsAsync(List<string> emails, List<Promotion> promotions, List<Product> products, List<Order> orders);
        Task SendPayrollPaymentAsync(User user, PayrollMonthly payroll, Payment payment);
    }

}
