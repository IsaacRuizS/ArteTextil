using ArteTextil.Data.Entities;

namespace ArteTextil.Interfaces
{
    public interface IEmailService
    {
        Task SendQuoteCreatedAsync(
            Quote quote,
            Customer customer
        );
    }

}
