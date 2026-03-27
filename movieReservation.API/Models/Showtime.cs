using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieReservation.Models;

public class Showtime
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid MovieId { get; set; }
    public Guid CinemaId { get; set; }
    
    public DateTime Date { get; set; }
    
    [MaxLength(10)]
    public string Time { get; set; } = string.Empty; // HH:mm
    
    [MaxLength(100)]
    public string Screen { get; set; } = string.Empty;
    
    [MaxLength(10)]
    public string Format { get; set; } = "2D";
    
    // Navigation
    [ForeignKey("MovieId")]
    public Movie Movie { get; set; } = null!;
    
    [ForeignKey("CinemaId")]
    public Cinema Cinema { get; set; } = null!;
    
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
