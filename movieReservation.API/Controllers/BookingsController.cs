using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReservation.Data;
using MovieReservation.DTOs;
using MovieReservation.Models;
using MovieReservation.Services;

namespace MovieReservation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly EmailService _emailService;
    public BookingsController(AppDbContext db, EmailService emailService) { _db = db; _emailService = emailService; }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? movieId, [FromQuery] Guid? cinemaId, [FromQuery] string? status)
    {
        var query = _db.Bookings
            .Include(b => b.Movie)
            .Include(b => b.Cinema)
            .Include(b => b.Showtime)
            .AsQueryable();

        if (movieId.HasValue) query = query.Where(b => b.MovieId == movieId.Value);
        if (cinemaId.HasValue) query = query.Where(b => b.CinemaId == cinemaId.Value);
        if (!string.IsNullOrEmpty(status)) query = query.Where(b => b.Status == status);

        var bookings = await query.OrderByDescending(b => b.BookingDate).ToListAsync();
        return Ok(bookings.Select(b => new BookingResponse(
            b.Id, b.MovieId, b.CinemaId, b.ShowtimeId, b.UserId,
            b.Seats, b.TotalPrice, b.BookingDate, b.Status,
            b.Movie.Title, b.Cinema.Name, b.Showtime.Time)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var b = await _db.Bookings
            .Include(x => x.Movie).Include(x => x.Cinema).Include(x => x.Showtime)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (b == null) return NotFound();
        return Ok(new BookingResponse(
            b.Id, b.MovieId, b.CinemaId, b.ShowtimeId, b.UserId,
            b.Seats, b.TotalPrice, b.BookingDate, b.Status,
            b.Movie.Title, b.Cinema.Name, b.Showtime.Time));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BookingCreateDto dto)
    {
        var booking = new Booking
        {
            MovieId = dto.MovieId, CinemaId = dto.CinemaId,
            ShowtimeId = dto.ShowtimeId, UserId = dto.UserId,
            Seats = dto.Seats, TotalPrice = dto.TotalPrice,
            BookingDate = DateTime.UtcNow, Status = "confirmed"
        };
        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        // Send booking confirmation email
        if (booking.UserId.HasValue)
        {
            var user = await _db.Users.FindAsync(booking.UserId.Value);
            var movie = await _db.Movies.FindAsync(booking.MovieId);
            var cinema = await _db.Cinemas.FindAsync(booking.CinemaId);
            var showtime = await _db.Showtimes.FindAsync(booking.ShowtimeId);
            if (user != null && movie != null && cinema != null && showtime != null)
            {
                _ = _emailService.SendBookingConfirmation(
                    user.Email, user.Name, movie.Title, cinema.Name,
                    showtime.Screen, showtime.Date.ToString("yyyy-MM-dd"), showtime.Time,
                    booking.Seats, booking.TotalPrice, booking.Id.ToString());
            }
        }

        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] BookingUpdateDto dto)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking == null) return NotFound();
        booking.Status = dto.Status;
        await _db.SaveChangesAsync();
        return Ok(booking);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking == null) return NotFound();
        _db.Bookings.Remove(booking);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
