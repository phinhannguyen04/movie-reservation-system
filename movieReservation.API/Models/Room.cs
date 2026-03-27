using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieReservation.Models;

public class Room
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public int Capacity { get; set; } = 100;
    
    [MaxLength(10)]
    public string Format { get; set; } = "2D"; // 2D, 3D, IMAX
    
    // FK
    public Guid CinemaId { get; set; }
    
    [ForeignKey("CinemaId")]
    public Cinema Cinema { get; set; } = null!;
}
