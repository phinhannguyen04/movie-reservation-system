using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieReservation.Models;

public class Booking
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid MovieId { get; set; }
    public Guid CinemaId { get; set; }
    public Guid ShowtimeId { get; set; }
    public Guid? UserId { get; set; }
    
    public List<string> Seats { get; set; } = new();
    
    public decimal TotalPrice { get; set; }
    
    public DateTime BookingDate { get; set; } = DateTime.UtcNow;
    
    [MaxLength(20)]
    public string Status { get; set; } = "confirmed"; // confirmed, cancelled, watched
    
    // Navigation
    [ForeignKey("MovieId")]
    public Movie Movie { get; set; } = null!;
    
    [ForeignKey("CinemaId")]
    public Cinema Cinema { get; set; } = null!;
    
    [ForeignKey("ShowtimeId")]
    public Showtime Showtime { get; set; } = null!;
    
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
