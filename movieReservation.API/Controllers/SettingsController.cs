using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReservation.Data;
using MovieReservation.Services;

namespace MovieReservation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly EmailService _emailService;

    public SettingsController(AppDbContext db, EmailService emailService)
    {
        _db = db;
        _emailService = emailService;
    }

    // ── Get email settings (hide password) ───────────────
    [HttpGet("email")]
    public async Task<IActionResult> GetEmailSettings()
    {
        var settings = await _db.SystemSettings.FirstOrDefaultAsync();
        if (settings == null) return Ok(new { configured = false });

        return Ok(new
        {
            configured = true,
            smtpHost = settings.SmtpHost,
            smtpPort = settings.SmtpPort,
            smtpUsername = settings.SmtpUsername,
            smtpPassword = "••••••••", // masked
            fromEmail = settings.FromEmail,
            fromName = settings.FromName,
            enableSsl = settings.EnableSsl,
            emailEnabled = settings.EmailEnabled,
            welcomeEmailSubject = settings.WelcomeEmailSubject,
            welcomeEmailTemplate = settings.WelcomeEmailTemplate,
            bookingEmailSubject = settings.BookingEmailSubject,
            bookingEmailTemplate = settings.BookingEmailTemplate
        });
    }

    // ── Update email settings ─────────────────────────────
    [HttpPut("email")]
    public async Task<IActionResult> UpdateEmailSettings([FromBody] EmailSettingsDto dto)
    {
        var settings = await _db.SystemSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new Models.SystemSettings();
            _db.SystemSettings.Add(settings);
        }

        settings.SmtpHost = dto.SmtpHost;
        settings.SmtpPort = dto.SmtpPort;
        settings.SmtpUsername = dto.SmtpUsername;
        if (dto.SmtpPassword != "••••••••") // Only update if not masked
            settings.SmtpPassword = dto.SmtpPassword;
        settings.FromEmail = dto.FromEmail;
        settings.FromName = dto.FromName;
        settings.EnableSsl = dto.EnableSsl;
        settings.EmailEnabled = dto.EmailEnabled;
        
        settings.WelcomeEmailSubject = dto.WelcomeEmailSubject;
        settings.WelcomeEmailTemplate = dto.WelcomeEmailTemplate;
        settings.BookingEmailSubject = dto.BookingEmailSubject;
        settings.BookingEmailTemplate = dto.BookingEmailTemplate;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Email settings updated successfully." });
    }

    // ── Send test email ───────────────────────────────────
    [HttpPost("email/test")]
    public async Task<IActionResult> SendTestEmail([FromBody] TestEmailDto dto)
    {
        var html = @"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 12px; overflow: hidden;'>
            <div style='background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;'>
                <h1 style='color: white; margin: 0;'>✅ Test Email</h1>
            </div>
            <div style='padding: 32px;'>
                <p>This is a test email from the Movie Reservation System.</p>
                <p>If you received this, your SMTP configuration is working correctly!</p>
            </div>
        </div>";

        var result = await _emailService.SendEmailAsync(dto.Email, "Test User", "🧪 Test Email — Movie Reservation", html);
        
        if (result)
            return Ok(new { message = $"Test email sent to {dto.Email}" });
        return BadRequest(new { message = "Failed to send email. Check your SMTP settings." });
    }
}

public record EmailSettingsDto(
    string SmtpHost, int SmtpPort, string SmtpUsername, string SmtpPassword,
    string FromEmail, string FromName, bool EnableSsl, bool EmailEnabled,
    string WelcomeEmailSubject, string WelcomeEmailTemplate, 
    string BookingEmailSubject, string BookingEmailTemplate);

public record TestEmailDto(string Email);

