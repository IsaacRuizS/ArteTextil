using ArteTextil.Data.Entities;
using ArteTextil.Interfaces;
using System.Net;
using System.Net.Mail;

namespace ArteTextil.Helpers
{
    public class EmailService : IEmailService
    {
        private readonly SmtpClient _smtp;

        public EmailService(IConfiguration config)
        {
            _smtp = new SmtpClient(config["Smtp:Host"])
            {
                Port = int.Parse(config["Smtp:Port"]),
                Credentials = new NetworkCredential(
                    config["Smtp:User"],
                    config["Smtp:Password"]
                ),
                EnableSsl = true
            };
        }

        public async Task SendQuoteCreatedAsync(Quote quote, Customer customer)
        {
            var orderedItems = quote.QuoteItems?.OrderBy(i => i.ProductId).ToList();

            var phone = customer.Phone ?? "No ingresado";

            var itemsHtml = string.Join("", orderedItems.Select(i => $@"
                <tr>
                    <td style='padding:10px;border-bottom:1px solid #eee;'>{i.ProductId}</td>
                    <td style='padding:10px;border-bottom:1px solid #eee;text-align:center;'>{i.Quantity}</td>
                    <td style='padding:10px;border-bottom:1px solid #eee;text-align:right;'>₡{i.Price:N2}</td>
                    <td style='padding:10px;border-bottom:1px solid #eee;text-align:right;'>₡{(i.Price * i.Quantity):N2}</td>
                </tr>
            "));

            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='UTF-8'>
                </head>
                <body style='font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:20px;'>
                    <table width='100%' cellpadding='0' cellspacing='0'>
                        <tr>
                            <td align='center'>
                                <table width='600' style='background:#ffffff;border-radius:8px;overflow:hidden;'>
                    
                                    <!-- HEADER -->
                                    <tr>
                                        <td style='background:#111827;color:#ffffff;padding:20px;'>
                                            <h2 style='margin:0;'>Cotización #{quote.QuoteId}</h2>
                                            <p style='margin:5px 0 0;font-size:14px;'>Arte Textil</p>
                                        </td>
                                    </tr>

                                    <!-- INFO -->
                                    <tr>
                                        <td style='padding:20px;'>
                                            <p><b>Cliente:</b> {customer.FullName}</p>
                                            <p><b>Email:</b> {customer.Email}</p>
                                            <p><b>Email:</b> {phone}</p>
                                            <p><b>Fecha:</b> {quote.CreatedAt:dd/MM/yyyy}</p>
                                            <p><b>Estado:</b> {quote.Status}</p>
                                            <p><b>Mensaje:</b> {quote.Notes}</p>
                                        </td>
                                    </tr>

                                    <!-- ITEMS -->
                                    <tr>
                                        <td style='padding:0 20px 20px;'>
                                            <h3 style='margin-bottom:10px;'>Detalle de productos</h3>

                                            <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;font-size:14px;'>
                                                <thead>
                                                    <tr style='background:#f3f4f6;'>
                                                        <th style='padding:10px;text-align:left;'>Producto</th>
                                                        <th style='padding:10px;text-align:center;'>Cantidad</th>
                                                        <th style='padding:10px;text-align:right;'>Precio</th>
                                                        <th style='padding:10px;text-align:right;'>Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {itemsHtml}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- TOTAL -->
                                    <tr>
                                        <td style='padding:20px;text-align:right;border-top:1px solid #eee;'>
                                            <h2 style='margin:0;'>Total: ₡{quote.Total:N2}</h2>
                                        </td>
                                    </tr>

                                    <!-- FOOTER -->
                                    <tr>
                                        <td style='background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#6b7280;'>
                                            Este correo fue generado automáticamente.<br/>
                                            © {DateTime.UtcNow.Year} Arte Textil
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                ";

            var mail = new MailMessage
            {
                Subject = $"Cotización #{quote.QuoteId} - Arte Textil",
                Body = body,
                IsBodyHtml = true,
                From = new MailAddress("no-reply@artetextil.com")
            };

            mail.To.Add(customer.Email ?? "");
            mail.To.Add("isaacruizse@gmail.com");

            await _smtp.SendMailAsync(mail);
        }
    }
}
