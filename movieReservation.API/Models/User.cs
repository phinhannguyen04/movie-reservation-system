using System.ComponentModel.DataAnnotations;

namespace MovieReservation.Models;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required, MaxLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [MaxLength(300)]
    public string PasswordHash { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string? Phone { get; set; }
    
    [MaxLength(500)]
    public string? Avatar { get; set; }
    
    [MaxLength(20)]
    public string Role { get; set; } = "customer"; // customer, vip
    
    [MaxLength(20)]
    public string Status { get; set; } = "active"; // active, inactive, locked
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
