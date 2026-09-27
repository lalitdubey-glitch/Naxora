
namespace Naxora.Models
{
    public interface IEmailService
    {
        Task<bool> SendEmail(string UserEmail, string subject, string body);
    }
}