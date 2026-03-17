using ArteTextil.Data;
using ArteTextil.Data.Entities;
using ArteTextil.Data.Repositories;
using ArteTextil.Interfaces;
using System.Net;
using System.Net.Mail;

namespace ArteTextil.Helpers
{
    public class QuoteRandomNumber
    {
        private readonly ArteTextilDbContext _context;
        private readonly IRepositoryQuote _repositoryQuote;
        public QuoteRandomNumber(ArteTextilDbContext context)
        {
            _context = context;
            _repositoryQuote = new RepositoryQuote(context);
        }

        public string GenerateQuoteNumber(int length = 8)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();

            return new string(Enumerable
                .Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)])
                .ToArray());
        }

        public async Task<string> GenerateUniqueQuoteNumber()
        {
            string quoteNumber;

            do
            {
                quoteNumber = GenerateQuoteNumber();
            }
            while (await _repositoryQuote.AnyAsync(q => q.QuoteNumber == quoteNumber));

            return quoteNumber;
        }

    }
}
