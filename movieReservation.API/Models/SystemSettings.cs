using System.ComponentModel.DataAnnotations;

namespace MovieReservation.Models;

public class SystemSettings
{
    [Key]
    public int Id { get; set; } = 1; // Singleton row
    
    // SMTP Configuration
    [MaxLength(200)]
    public string SmtpHost { get; set; } = "smtp.gmail.com";
    
    public int SmtpPort { get; set; } = 587;
    
    [MaxLength(200)]
    public string SmtpUsername { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string SmtpPassword { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string FromEmail { get; set; } = "noreply@moviereservation.com";
    
    [MaxLength(200)]
    public string FromName { get; set; } = "Movie Reservation";
    
    public bool EnableSsl { get; set; } = true;
    
    public bool EmailEnabled { get; set; } = false; // Disabled by default until configured

    // Email Templates
    public string WelcomeEmailSubject { get; set; } = "Welcome to Movie Reservation!";
    public string WelcomeEmailTemplate { get; set; } = ""; // Will be seeded with default HTML

    public string BookingEmailSubject { get; set; } = "Booking Confirmed!";
    public string BookingEmailTemplate { get; set; } = ""; // Will be seeded with default HTML

    public string StaffInviteEmailSubject { get; set; } = "Staff Invitation";
    public string StaffInviteEmailTemplate { get; set; } = ""; // Will be seeded with default HTML
}
