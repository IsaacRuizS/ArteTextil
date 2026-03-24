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
                                            <h2 style='margin:0;'>Cotización #{quote.QuoteNumber}</h2>
                                            <p style='margin:5px 0 0;font-size:14px;'>Arte Textil</p>
                                        </td>
                                    </tr>

                                    <!-- INFO -->
                                    <tr>
                                        <td style='padding:20px;'>
                                            <p><b>Cliente:</b> {customer.FullName}</p>
                                            <p><b>Email:</b> {customer.Email}</p>
                                            <p><b>Teléfono:</b> {phone}</p>
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
                Subject = $"Cotización #{quote.QuoteNumber} - Arte Textil",
                Body = body,
                IsBodyHtml = true,
                From = new MailAddress("no-reply@artetextil.com")
            };

            mail.To.Add(customer.Email ?? "");
            mail.To.Add("isaacruizse@gmail.com");

            await _smtp.SendMailAsync(mail);
        }

        public async Task SendRegistrationConfirmationAsync(string fullName, string email)
        {
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
                                            <h2 style='margin:0;'>Bienvenido a Arte Textil</h2>
                                            <p style='margin:5px 0 0;font-size:14px;'>Tu cuenta ha sido creada exitosamente</p>
                                        </td>
                                    </tr>

                                    <!-- BODY -->
                                    <tr>
                                        <td style='padding:30px;'>
                                            <p style='font-size:16px;'>Hola, <b>{fullName}</b></p>
                                            <p style='font-size:14px;color:#374151;'>
                                                Tu registro en Arte Textil se ha completado correctamente.
                                                Ya puedes iniciar sesión con tu correo electrónico y contraseña.
                                            </p>
                                            <p style='font-size:14px;color:#374151;'>
                                                <b>Correo registrado:</b> {email}
                                            </p>
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
                Subject = "Confirmación de registro - Arte Textil",
                Body = body,
                IsBodyHtml = true,
                From = new MailAddress("no-reply@artetextil.com")
            };

            mail.To.Add(email);

            await _smtp.SendMailAsync(mail);
        }

        public async Task SendPromotionsExpiringAsync(List<string>? emails, List<Promotion> promotions)
        {
            if (emails == null || !emails.Any() || promotions == null || !promotions.Any())
                return;

            var orderedPromotions = promotions.OrderBy(p => p.EndDate).ToList();

            var promotionsHtml = string.Join("", orderedPromotions.Select(p => $@"
                <tr>
                    <td style='padding:10px;border-bottom:1px solid #eee;'>{p.Name}</td>
                    <td style='padding:10px;border-bottom:1px solid #eee;text-align:center;'>{p.DiscountPercent}%</td>
                    <td style='padding:10px;border-bottom:1px solid #eee;text-align:center;'>{p.StartDate:dd/MM/yyyy}</td>
                    <td style='padding:10px;border-bottom:1px solid #eee;text-align:center;color:#dc2626;font-weight:bold;'>{p.EndDate:dd/MM/yyyy}</td>
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
                                            <h2 style='margin:0;'>Promociones por vencer</h2>
                                            <p style='margin:5px 0 0;font-size:14px;'>Arte Textil</p>
                                        </td>
                                    </tr>

                                    <!-- INFO -->
                                    <tr>
                                        <td style='padding:20px;'>
                                            <p>Hola,</p>
                                            <p>Aprovecha estas promociones que están próximas a vencer en las próximas 24 horas:</p>
                                        </td>
                                    </tr>

                                    <!-- TABLE -->
                                    <tr>
                                        <td style='padding:0 20px 20px;'>
                                            <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;font-size:14px;'>
                                                <thead>
                                                    <tr style='background:#f3f4f6;'>
                                                        <th style='padding:10px;text-align:left;'>Promoción</th>
                                                        <th style='padding:10px;text-align:center;'>Descuento</th>
                                                        <th style='padding:10px;text-align:center;'>Inicio</th>
                                                        <th style='padding:10px;text-align:center;'>Fin</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {promotionsHtml}
                                                </tbody>
                                            </table>
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

            foreach (var email in emails)
            {
                if (string.IsNullOrWhiteSpace(email))
                    continue;

                var mail = new MailMessage
                {
                    Subject = "Promociones por vencer - Arte Textil",
                    Body = body,
                    IsBodyHtml = true,
                    From = new MailAddress("no-reply@artetextil.com")
                };

                mail.To.Add(email);

                await _smtp.SendMailAsync(mail);
            }
        }

        public async Task SendDailyAlertsToAdminsAsync(List<string> emails, List<Promotion> promotions, List<Product> products, List<Order> orders)
        {
            if (emails == null || !emails.Any())
                return;

            // PROMOCIONES
            var promotionsHtml = string.Join("", promotions.Select(p => $@"
                <tr>
                    <td style='padding:8px;border-bottom:1px solid #eee;'>{p.Name}</td>
                    <td style='padding:8px;border-bottom:1px solid #eee;text-align:center;'>{p.Product?.Name}</td>
                    <td style='padding:8px;border-bottom:1px solid #eee;text-align:center;'>{p.DiscountPercent}%</td>
                    <td style='padding:8px;border-bottom:1px solid #eee;text-align:center;color:#dc2626;font-weight:bold;'>{p.EndDate:dd/MM/yyyy}</td>
                </tr>
            "));

            // PRODUCTOS
            var productsHtml = string.Join("", products.Select(p => $@"
                <tr>
                    <td style='padding:8px;border-bottom:1px solid #eee;'>{p.Name}</td>
                    <td style='padding:8px;border-bottom:1px solid #eee;text-align:center;'>{p.Stock}</td>
                    <td style='padding:8px;border-bottom:1px solid #eee;text-align:center;'>{p.QuantityReserved}</td>
                    <td style='padding:8px;border-bottom:1px solid #eee;text-align:center;color:#dc2626;font-weight:bold;'>{p.MinStock}</td>
                </tr>
            "));

            // ORDENES
            var now = DateTime.Now;

            var ordersHtml = string.Join("", orders.Select(o => $@"
                <tr>
                    <td style='padding:8px;border-bottom:1px solid #eee;'>#{o.OrderId}</td>
                    <td style='padding:8px;border-bottom:1px solid #eee;text-align:center;'>{o.Status}</td>
                    <td style='padding:8px;border-bottom:1px solid #eee;text-align:center;'>{o.DeliveryDate:dd/MM/yyyy}</td>
                    <td style='padding:8px;border-bottom:1px solid #eee;text-align:center;
                        color:{(o.DeliveryDate < now ? "#dc2626" : "#f59e0b")};
                        font-weight:bold;'>
                        {(o.DeliveryDate < now ? "VENCIDA" : "POR VENCER")}
                    </td>
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

                                <table width='700' style='background:#ffffff;border-radius:8px;overflow:hidden;'>

                                    <!-- HEADER -->
                                    <tr>
                                        <td style='background:#111827;color:#ffffff;padding:20px;'>
                                            <h2 style='margin:0;'>Reporte de Alertas</h2>
                                            <p style='margin:5px 0 0;font-size:14px;'>Arte Textil</p>
                                        </td>
                                    </tr>

                                    <!-- RESUMEN -->
                                    <tr>
                                        <td style='padding:20px;'>
                                            <p><b>Resumen:</b></p>
                                            <ul>
                                                <li>Promociones por vencer: <b>{promotions.Count}</b></li>
                                                <li>Productos con bajo stock: <b>{products.Count}</b></li>
                                                <li>Órdenes críticas: <b>{orders.Count}</b></li>
                                            </ul>
                                        </td>
                                    </tr>

                                    <!-- PROMOCIONES -->
                                    <tr>
                                        <td style='padding:0 20px 20px;'>
                                            <h3>Promociones por vencer</h3>
                                            <table width='100%' style='border-collapse:collapse;font-size:13px;'>
                                                <thead>
                                                    <tr style='background:#f3f4f6;'>
                                                        <th style='padding:8px;text-align:left;'>Promoción</th>
                                                        <th style='padding:8px;text-align:center;'>Producto</th>
                                                        <th style='padding:8px;text-align:center;'>Descuento</th>
                                                        <th style='padding:8px;text-align:center;'>Fin</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {promotionsHtml}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- PRODUCTOS -->
                                    <tr>
                                        <td style='padding:0 20px 20px;'>
                                            <h3>Productos con bajo stock</h3>
                                            <table width='100%' style='border-collapse:collapse;font-size:13px;'>
                                                <thead>
                                                    <tr style='background:#f3f4f6;'>
                                                        <th style='padding:8px;text-align:left;'>Producto</th>
                                                        <th style='padding:8px;text-align:center;'>Stock</th>
                                                        <th style='padding:8px;text-align:center;'>Reservado</th>
                                                        <th style='padding:8px;text-align:center;'>Mínimo</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {productsHtml}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- ORDENES -->
                                    <tr>
                                        <td style='padding:0 20px 20px;'>
                                            <h3>Órdenes críticas</h3>
                                            <table width='100%' style='border-collapse:collapse;font-size:13px;'>
                                                <thead>
                                                    <tr style='background:#f3f4f6;'>
                                                        <th style='padding:8px;text-align:left;'>Orden</th>
                                                        <th style='padding:8px;text-align:center;'>Estado</th>
                                                        <th style='padding:8px;text-align:center;'>Entrega</th>
                                                        <th style='padding:8px;text-align:center;'>Condición</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ordersHtml}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- FOOTER -->
                                    <tr>
                                        <td style='background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#6b7280;'>
                                            Este reporte fue generado automáticamente.<br/>
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

            foreach (var email in emails)
            {
                var mail = new MailMessage
                {
                    Subject = "Reporte de alertas - Arte Textil",
                    Body = body,
                    IsBodyHtml = true,
                    From = new MailAddress("no-reply@artetextil.com")
                };

                mail.To.Add(email);

                await _smtp.SendMailAsync(mail);
            }
        }
    }
}
