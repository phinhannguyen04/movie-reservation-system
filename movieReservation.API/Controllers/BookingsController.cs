using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReservation.Data;
using MovieReservation.Models;
using MovieReservation.DTOs;
using System.Security.Claims;

namespace MovieReservation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;
    public BookingsController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? movieId, 
        [FromQuery] Guid? cinemaId, 
        [FromQuery] string? status, 
        [FromQuery] string? search,
        [FromQuery] PaginationParams pagination)
    {
        var query = _db.Bookings
            .Include(b => b.User)
            .AsNoTracking()
            .AsQueryable();
 
        if (movieId.HasValue) query = query.Where(b => b.MovieId == movieId.Value);
        if (cinemaId.HasValue) query = query.Where(b => b.CinemaId == cinemaId.Value);
        if (!string.IsNullOrEmpty(status)) query = query.Where(b => b.Status == status);

        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(b => 
                b.MovieTitle.ToLower().Contains(s) || 
                (b.User != null && b.User.Name.ToLower().Contains(s)) ||
                b.Id.ToString().Contains(s)
            );
        }
 
        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(b => b.BookingDate)
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        // ── Smart Name Resolution (for Staff bookings) ──
        var missingUserIds = items
            .Where(b => b.User == null && b.UserId.HasValue)
            .Select(b => b.UserId!.Value)
            .Distinct()
            .ToList();

        var staffNames = new Dictionary<Guid, string>();
        if (missingUserIds.Any())
        {
            staffNames = await _db.Staff
                .Where(s => missingUserIds.Contains(s.Id))
                .ToDictionaryAsync(s => s.Id, s => s.Name);
        }
        // ────────────────────────────────────────────────

        var response = items.Select(b => MapToResponse(b, staffNames.GetValueOrDefault(b.UserId ?? Guid.Empty))).ToList();
        return Ok(new PagedResponse<object>(response, totalCount, pagination.PageNumber, pagination.PageSize));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var b = await _db.Bookings
            .Include(b => b.User)
            .FirstOrDefaultAsync(x => x.Id == id);
            
        if (b == null) return NotFound();

        string? staffName = null;
        if (b.User == null && b.UserId.HasValue)
        {
            staffName = (await _db.Staff.FindAsync(b.UserId.Value))?.Name;
        }

        return Ok(MapToResponse(b, staffName));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] FlexibleBookingDto dto)
    {
        Guid? userId = null;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedUserId))
            userId = parsedUserId;

        Guid.TryParse(dto.MovieId, out var movieGuid);
        Guid.TryParse(dto.CinemaId, out var cinemaGuid);
        Guid.TryParse(dto.ShowtimeId, out var showtimeGuid);
        
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
            // Force UTC kind for Npgsql compatibility
            BookingDate  = dto.BookingDate.HasValue 
                          ? DateTime.SpecifyKind(dto.BookingDate.Value, DateTimeKind.Utc) 
                          : DateTime.UtcNow,
            Status       = "confirmed",
            MovieTitle   = dto.MovieTitle ?? string.Empty,
            CinemaName   = dto.CinemaName ?? string.Empty,
            Showtime     = dto.Showtime ?? string.Empty,
            Screen       = dto.Screen ?? string.Empty,
        };

        using var transaction = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        try
        {
            var targetDate = DateTime.SpecifyKind(booking.BookingDate.Date, DateTimeKind.Utc);
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

            string? staffName = null;
            if (booking.User == null && booking.UserId.HasValue)
            {
                staffName = (await _db.Staff.FindAsync(booking.UserId.Value))?.Name;
            }

            return Ok(MapToResponse(booking, staffName));
        }
        catch
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Lỗi hệ thống khi xử lý đặt vé. Vui lòng thử lại." });
        }
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
        // Force UTC kind for Npgsql 6.0+ compatibility
        var utcDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        
        var movieTitleLower = (movieTitle ?? "").Trim().ToLower();
        var cinemaNameLower = (cinemaName ?? "").Trim().ToLower();
        var showtimeLower   = (showtime ?? "").Trim().ToLower();
        var screenLower     = (screen ?? "").Trim().ToLower();

        var seats = await _db.Bookings
            .Where(b => b.MovieTitle.Trim().ToLower() == movieTitleLower
                     && b.CinemaName.Trim().ToLower() == cinemaNameLower 
                     && b.Showtime.Trim().ToLower()   == showtimeLower 
                     && b.Screen.Trim().ToLower()     == screenLower 
                     && b.BookingDate.Date == utcDate
                     && b.Status != "cancelled")
            .SelectMany(b => b.Seats)
            .Distinct()
            .ToListAsync();

        return Ok(seats.Select(s => s.Trim()));
    }

    private static object MapToResponse(Booking b, string? staffName = null) => new
    {
        id          = b.Id,
        movieId     = b.MovieId,
        cinemaId    = b.CinemaId,
        showtimeId  = b.ShowtimeId,
        userId      = b.UserId,
        userName    = b.User?.Name ?? staffName ?? "Guest",
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

