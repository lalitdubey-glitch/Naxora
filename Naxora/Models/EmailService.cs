using System.Net;
using System.Net.Mail;

namespace Naxora.Models
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task<bool> SendEmail(string UserEmail, string subject, string body)
        {
            string? AdminEmail = _config["EmailAddress:AdminEmail"];
            string? AdminPass = _config["EmailAddress:AdminPass"];

            try
            {
                if (string.IsNullOrWhiteSpace(AdminEmail) || string.IsNullOrWhiteSpace(AdminPass))
                {
                    return false;
                }

                using var smtp = new SmtpClient()
                {
                    Host = "smtp.gmail.com",
                    Port = 587,
                    EnableSsl = true,
                    Credentials = new NetworkCredential(AdminEmail, AdminPass)
                };

                using var EmailMessage = new MailMessage()
                {
                    From = new MailAddress(AdminEmail, "Lalit Dubey"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                EmailMessage.To.Add(UserEmail);
                await smtp.SendMailAsync(EmailMessage);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
