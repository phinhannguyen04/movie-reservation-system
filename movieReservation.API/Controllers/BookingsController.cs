using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReservation.Data;
using MovieReservation.Models;
using MovieReservation.Services;
using MovieReservation.DTOs;
using System.Security.Claims;

namespace MovieReservation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly EmailService _emailService;
    public BookingsController(AppDbContext db, EmailService emailService) { _db = db; _emailService = emailService; }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? movieId, [FromQuery] Guid? cinemaId, [FromQuery] string? status, [FromQuery] PaginationParams pagination)
    {
        var query = _db.Bookings.AsNoTracking().AsQueryable();
 
        if (movieId.HasValue) query = query.Where(b => b.MovieId == movieId.Value);
        if (cinemaId.HasValue) query = query.Where(b => b.CinemaId == cinemaId.Value);
        if (!string.IsNullOrEmpty(status)) query = query.Where(b => b.Status == status);
 
        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(b => b.BookingDate)
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        return Ok(new PagedResponse<object>(items.Select(b => MapToResponse(b)).ToList(), totalCount, pagination.PageNumber, pagination.PageSize));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var b = await _db.Bookings.FirstOrDefaultAsync(x => x.Id == id);
        if (b == null) return NotFound();
        return Ok(MapToResponse(b));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] FlexibleBookingDto dto)
    {
        // Extract UserId from JWT if present
        Guid? userId = null;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedUserId))
            userId = parsedUserId;

        // MovieId, CinemaId, ShowtimeId may be mock string IDs — try to parse, fall back to null
        Guid.TryParse(dto.MovieId, out var movieGuid);
        Guid.TryParse(dto.CinemaId, out var cinemaGuid);
        Guid.TryParse(dto.ShowtimeId, out var showtimeGuid);
        
        // If JWT doesn't grab it, fallback to the provided client-side UserId
        if (!userId.HasValue && !string.IsNullOrEmpty(dto.UserId) && Guid.TryParse(dto.UserId, out var clientUserId)) {
            userId = clientUserId;
        }

        var booking = new Booking
        {
            MovieId      = movieGuid != Guid.Empty ? movieGuid : null,
            CinemaId     = cinemaGuid != Guid.Empty ? cinemaGuid : null,
            ShowtimeId   = showtimeGuid != Guid.Empty ? showtimeGuid : null,
            UserId       = userId,
            Seats        = dto.Seats ?? new List<string>(),
            TotalPrice   = dto.TotalPrice,
            BookingDate  = dto.BookingDate ?? DateTime.UtcNow,
            Status       = "confirmed",
            MovieTitle   = dto.MovieTitle ?? string.Empty,
            CinemaName   = dto.CinemaName ?? string.Empty,
            Showtime     = dto.Showtime ?? string.Empty,
            Screen       = dto.Screen ?? string.Empty,
        };

        // Use a Transaction to ensure serializable seat checking in high concurrency
        using var transaction = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        try
        {
            var targetDate = booking.BookingDate.Date;
            var existingSeats = await _db.Bookings
                .Where(b => b.MovieTitle == booking.MovieTitle 
                         && b.CinemaName == booking.CinemaName 
                         && b.Showtime == booking.Showtime 
                         && b.Screen == booking.Screen 
                         && b.BookingDate.Date == targetDate
                         && b.Status != "cancelled")
                .SelectMany(b => b.Seats)
                .ToListAsync();

            if (booking.Seats.Any(s => existingSeats.Contains(s)))
            {
                return BadRequest(new { message = "Xin lỗi, ghế bạn chọn vừa có người khác đặt xong! Vui lòng chọn ghế khác." });
            }

            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Lỗi hệ thống khi xử lý đặt vé. Vui lòng thử lại." });
        }


        // Send booking confirmation email via fire-and-forget
        if (userId.HasValue)
        {
            var user = await _db.Users.FindAsync(userId.Value);
            if (user != null)
            {
                _ = _emailService.SendBookingConfirmation(
                    user.Email, user.Name,
                    booking.MovieTitle, booking.CinemaName,
                    booking.Screen, booking.BookingDate.ToString("yyyy-MM-dd"), booking.Showtime,
                    booking.Seats, booking.TotalPrice, booking.Id.ToString());
            }
        }

        return Ok(MapToResponse(booking));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] BookingUpdateRequestDto dto)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking == null) return NotFound();
        booking.Status = dto.Status;
        await _db.SaveChangesAsync();
        return Ok(MapToResponse(booking));
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

    [HttpGet("occupied-seats")]
    public async Task<IActionResult> GetOccupiedSeats([FromQuery] string movieTitle, [FromQuery] string cinemaName, [FromQuery] string showtime, [FromQuery] string screen, [FromQuery] DateTime date)
    {
        var targetDate = date.Date;
        var movieTitleLower = (movieTitle ?? "").Trim().ToLower();
        var cinemaNameLower = (cinemaName ?? "").Trim().ToLower();
        var showtimeLower   = (showtime ?? "").Trim().ToLower();
        var screenLower     = (screen ?? "").Trim().ToLower();

        var seats = await _db.Bookings
            .Where(b => b.MovieTitle.Trim().ToLower() == movieTitleLower
                     && b.CinemaName.Trim().ToLower() == cinemaNameLower 
                     && b.Showtime.Trim().ToLower()   == showtimeLower 
                     && b.Screen.Trim().ToLower()     == screenLower 
                     && b.BookingDate.Date == targetDate
                     && b.Status != "cancelled")
            .SelectMany(b => b.Seats)
            .Distinct()
            .ToListAsync();

        return Ok(seats.Select(s => s.Trim()));
    }

    private static object MapToResponse(Booking b) => new
    {
        id          = b.Id,
        movieId     = b.MovieId,
        cinemaId    = b.CinemaId,
        showtimeId  = b.ShowtimeId,
        userId      = b.UserId,
        seats       = b.Seats,
        totalPrice  = b.TotalPrice,
        bookingDate = b.BookingDate,
        status      = b.Status,
        movieTitle  = b.MovieTitle,
        cinemaName  = b.CinemaName,
        showtime    = b.Showtime,
        screen      = b.Screen,
    };
}

// Accept string IDs so mock IDs from the frontend don't cause parse errors
public record FlexibleBookingDto(
    string? MovieId, string? CinemaId, string? ShowtimeId,
    List<string>? Seats, decimal TotalPrice,
    string? MovieTitle, string? CinemaName, string? Showtime, string? Screen, string? UserId, DateTime? BookingDate);

public record BookingUpdateRequestDto(string Status);
