using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReservation.Data;
using MovieReservation.DTOs;
using MovieReservation.Models;

namespace MovieReservation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShowtimesController : ControllerBase
{
    private readonly AppDbContext _db;
    public ShowtimesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? movieId, [FromQuery] Guid? cinemaId, [FromQuery] string? date)
    {
        var query = _db.Showtimes.Include(s => s.Movie).Include(s => s.Cinema).AsQueryable();
        
        if (movieId.HasValue) query = query.Where(s => s.MovieId == movieId.Value);
        if (cinemaId.HasValue) query = query.Where(s => s.CinemaId == cinemaId.Value);
        if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var d))
            query = query.Where(s => s.Date.Date == d.Date);

        var showtimes = await query.OrderBy(s => s.Date).ThenBy(s => s.Time).ToListAsync();
        return Ok(showtimes.Select(s => new ShowtimeResponse(
            s.Id, s.MovieId, s.CinemaId, s.Date, s.Time, s.Screen, s.Format,
            s.Movie.Title, s.Cinema.Name)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var s = await _db.Showtimes.Include(x => x.Movie).Include(x => x.Cinema).FirstOrDefaultAsync(x => x.Id == id);
        if (s == null) return NotFound();
        return Ok(new ShowtimeResponse(s.Id, s.MovieId, s.CinemaId, s.Date, s.Time, s.Screen, s.Format, s.Movie.Title, s.Cinema.Name));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ShowtimeCreateDto dto)
    {
        var showtime = new Showtime
        {
            MovieId = dto.MovieId, CinemaId = dto.CinemaId,
            Date = dto.Date, Time = dto.Time, Screen = dto.Screen, Format = dto.Format
        };
        _db.Showtimes.Add(showtime);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = showtime.Id }, showtime);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ShowtimeUpdateDto dto)
    {
        var showtime = await _db.Showtimes.FindAsync(id);
        if (showtime == null) return NotFound();
        showtime.MovieId = dto.MovieId; showtime.CinemaId = dto.CinemaId;
        showtime.Date = dto.Date; showtime.Time = dto.Time;
        showtime.Screen = dto.Screen; showtime.Format = dto.Format;
        await _db.SaveChangesAsync();
        return Ok(showtime);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var showtime = await _db.Showtimes.FindAsync(id);
        if (showtime == null) return NotFound();
        _db.Showtimes.Remove(showtime);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
