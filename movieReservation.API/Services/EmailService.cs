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

    public async Task SendStaffInviteEmail(string email, string name, string role, string temporaryPassword)
    {
        var settings = await GetSettings();
        var subject = settings?.StaffInviteEmailSubject ?? "Cinemax: You've been invited as Staff!";
        var html = settings?.StaffInviteEmailTemplate ?? "";

        if (string.IsNullOrEmpty(html))
        {
            // Fallback with fixed placeholders
            html = @"
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e0e0e0; border-radius: 12px; overflow: hidden; border: 1px solid #222;'>
    <div style='background: linear-gradient(135deg, #e50914, #b20710); padding: 32px; text-align: center;'>
        <h1 style='color: white; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;'>STAFF INVITATION</h1>
    </div>
    <div style='padding: 32px;'>
        <p style='font-size: 16px; color: #ffffff;'>Dear <strong>{{name}}</strong>,</p>
        <p style='color: #a3a3a3; line-height: 1.5;'>You have been added to the Cinemax system as a staff member by the administrator.</p>
        <div style='background: #141414; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #e50914; box-shadow: 0 4px 15px rgba(0,0,0,0.5);'>
            <p style='margin: 8px 0; font-size: 15px;'><strong>System Role:</strong> <span style='color: #e50914; font-weight: bold; text-transform: uppercase;'>{{role}}</span></p>
            <p style='margin: 8px 0; font-size: 15px;'><strong>Login Email:</strong> <span style='color: #ffffff;'>{{email}}</span></p>
            <p style='margin: 8px 0; font-size: 15px;'><strong>Temporary Password:</strong> <span style='color: #ffffff; font-family: monospace;'>{{password}}</span></p>
        </div>
        <p style='color: #f59e0b; font-size: 13px;'>⚠️ For security reasons, please change your password immediately after logging in for the first time.</p>
        <div style='text-align: center; margin-top: 32px; margin-bottom: 16px;'>
            <a href='http://localhost:5173/admin' style='display: inline-block; background: #e50914; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4);'>ACCESS ADMIN PANEL</a>
        </div>
    </div>
    <div style='background: #050505; border-top: 1px solid #1a1a1a; padding: 20px; text-align: center; font-size: 12px; color: #666;'>© 2026 Cinemax Reservation System. <br/>Internal Staff Communication.</div>
</div>";
        }

        html = html.Replace("{{name}}", name)
                   .Replace("{{email}}", email)
                   .Replace("{{role}}", role)
                   .Replace("{{password}}", temporaryPassword);

        await SendEmailAsync(email, name, subject, html);
    }
}
