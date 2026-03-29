using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieReservation.Models;

public enum SeatCategory
{
    Standard,
    VIP,
    Sweetbox
}

public class ShowTimeSeatPrice
{
    [Key]
    public Guid ShowTimeSeatPriceId { get; set; }
    public Guid ShowtimeId { get; set; }
    public SeatCategory Category { get; set; } = SeatCategory.Standard;
    public decimal Price  { get; set; }

    [ForeignKey("ShowtimeId")] public Showtime Showtime { get; set; } = null;
}