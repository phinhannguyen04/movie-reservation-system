using System.ComponentModel.DataAnnotations;

namespace MovieReservation.Models;

public class Movie
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string PosterUrl { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string BackdropUrl { get; set; } = string.Empty;
    
    public List<string> Genre { get; set; } = new();
    
    public int Duration { get; set; } // minutes
    
    [MaxLength(10)]
    public string Rating { get; set; } = "PG-13";
    
    public DateTime ReleaseDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    [MaxLength(2000)]
    public string Synopsis { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string Director { get; set; } = string.Empty;
    
    public List<string> Cast { get; set; } = new();
    
    [MaxLength(500)]
    public string? TrailerUrl { get; set; }
    
    // Navigation
    public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
}
