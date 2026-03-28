using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieReservation.Models;

public class Booking
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid? MovieId { get; set; }
    public Guid? CinemaId { get; set; }
    public Guid? ShowtimeId { get; set; }
    public Guid? UserId { get; set; }
    
    // Denormalised display fields so we always have readable info
    [MaxLength(300)]
    public string MovieTitle { get; set; } = string.Empty;
    
    [MaxLength(300)]
    public string CinemaName { get; set; } = string.Empty;
    
    [MaxLength(10)]
    public string Showtime { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string Screen { get; set; } = string.Empty;

    public List<string> Seats { get; set; } = new();
    
    public decimal TotalPrice { get; set; }
    
    public DateTime BookingDate { get; set; } = DateTime.UtcNow;
    
    [MaxLength(20)]
    public string Status { get; set; } = "confirmed"; // confirmed, cancelled, watched
    
    // Optional navigation (may be null for bookings from mock-data IDs)
    [ForeignKey("MovieId")]
    public Movie? Movie { get; set; }
    
    [ForeignKey("CinemaId")]
    public Cinema? Cinema { get; set; }
    
    [ForeignKey("ShowtimeId")]
    public Showtime? ShowtimeRef { get; set; }

    // Navigation with manual relationship mapping in Fluent API
    public User? User { get; set; }
}
