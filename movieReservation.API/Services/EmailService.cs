using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MimeKit;

using MovieReservation.Data;

namespace MovieReservation.Services;

public class EmailService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IServiceScopeFactory scopeFactory, ILogger<EmailService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    private async Task<Models.SystemSettings?> GetSettings()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db.SystemSettings.FirstOrDefaultAsync();
    }


    public async Task<bool> SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var settings = await GetSettings();
        if (settings == null || !settings.EmailEnabled)
        {
            _logger.LogWarning("Email is disabled or not configured. Skipping email to {Email}", toEmail);
            return false;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(settings.FromName, settings.FromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            message.Body = new TextPart("html") { Text = htmlBody };

            using var client = new SmtpClient();
            var secureOption = settings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None;
            await client.ConnectAsync(settings.SmtpHost, settings.SmtpPort, secureOption);
            
            if (!string.IsNullOrEmpty(settings.SmtpUsername))
                await client.AuthenticateAsync(settings.SmtpUsername, settings.SmtpPassword);
            
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent to {Email}: {Subject}", toEmail, subject);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            return false;
        }
    }

    // ── Email Templates ──────────────────────────────────

    public async Task SendWelcomeEmail(string email, string name, string password)
    {
        var settings = await GetSettings();
        var subject = settings?.WelcomeEmailSubject ?? "Welcome to Movie Reservation! ";
        var html = settings?.WelcomeEmailTemplate ?? "";

        if (string.IsNullOrEmpty(html))
        {
            // Fallback if template is empty
            html = $@"<h1>Welcome {name}!</h1><p>Email: {email}</p><p>Password: {password}</p>";
        }
        else
        {
            html = html.Replace("{{name}}", name)
                       .Replace("{{email}}", email)
                       .Replace("{{password}}", password);
        }

        await SendEmailAsync(email, name, subject, html);
    }

    public async Task SendBookingConfirmation(string email, string customerName, string movieTitle, string cinemaName, string screen, string date, string time, List<string> seats, decimal totalPrice, string bookingId)
    {
        var settings = await GetSettings();
        var subject = settings?.BookingEmailSubject ?? "Booking Confirmed!";
        var html = settings?.BookingEmailTemplate ?? "";
        var seatList = string.Join(", ", seats);

        if (string.IsNullOrEmpty(html))
        {
            // Fallback
            html = $@"<h1>Booking Confirmed!</h1><p>Movie: {movieTitle}</p><p>Seats: {seatList}</p><p>ID: {bookingId}</p>";
        }
        else
        {
            html = html.Replace("{{customerName}}", customerName)
                       .Replace("{{movieTitle}}", movieTitle)
                       .Replace("{{cinemaName}}", cinemaName)
                       .Replace("{{screen}}", screen)
                       .Replace("{{date}}", date)
                       .Replace("{{time}}", time)
                       .Replace("{{seats}}", seatList)
                       .Replace("{{totalPrice}}", totalPrice.ToString("F2"))
                       .Replace("{{bookingId}}", bookingId);
        }

        await SendEmailAsync(email, customerName, subject, html);
    }
}
