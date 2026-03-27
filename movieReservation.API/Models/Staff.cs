using System.ComponentModel.DataAnnotations;

namespace MovieReservation.Models;

public class Staff
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required, MaxLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [MaxLength(300)]
    public string PasswordHash { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Avatar { get; set; }
    
    [MaxLength(30)]
    public string Role { get; set; } = "staff"; // admin, manager, staff
    
    [MaxLength(20)]
    public string Status { get; set; } = "active"; // active, inactive
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
