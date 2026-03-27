using System.ComponentModel.DataAnnotations;

namespace MovieReservation.Models;

public class Cinema
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string Distance { get; set; } = "0 km";
    
    // Navigation
    public ICollection<Room> Rooms { get; set; } = new List<Room>();
    public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
}
