using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReservation.Data;
using MovieReservation.DTOs;
using MovieReservation.Models;

namespace MovieReservation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly AppDbContext _db;
    public MoviesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? genre, [FromQuery] string? rating, [FromQuery] string? status, [FromQuery] PaginationParams pagination)
    {
        var query = _db.Movies.AsNoTracking().AsQueryable();
        
        if (!string.IsNullOrEmpty(genre))
            query = query.Where(m => m.Genre.Contains(genre));
        
        if (!string.IsNullOrEmpty(rating))
            query = query.Where(m => m.Rating == rating);

        if (!string.IsNullOrEmpty(status))
        {
            var now = DateTime.UtcNow;
            query = status.ToLower() switch
            {
                "showing" => query.Where(m => m.ReleaseDate <= now && (m.EndDate == null || m.EndDate >= now)),
                "upcoming" => query.Where(m => m.ReleaseDate > now),
                "ended" => query.Where(m => m.EndDate != null && m.EndDate < now),
                _ => query
            };
        }
        
        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(m => m.ReleaseDate)
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .Select(m => new MovieResponse(
                m.Id, m.Title, m.PosterUrl, m.BackdropUrl, m.Genre, m.Duration, m.Rating,
                m.ReleaseDate, m.EndDate, m.Synopsis, m.Director, m.Cast, m.TrailerUrl))
            .ToListAsync();

        return Ok(new PagedResponse<MovieResponse>(items, totalCount, pagination.PageNumber, pagination.PageSize));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var m = await _db.Movies.FindAsync(id);
        if (m == null) return NotFound();
        return Ok(new MovieResponse(
            m.Id, m.Title, m.PosterUrl, m.BackdropUrl, m.Genre, m.Duration, m.Rating,
            m.ReleaseDate, m.EndDate, m.Synopsis, m.Director, m.Cast, m.TrailerUrl));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MovieCreateDto dto)
    {
        var movie = new Movie
        {
            Title = dto.Title, PosterUrl = dto.PosterUrl, BackdropUrl = dto.BackdropUrl,
            Genre = dto.Genre, Duration = dto.Duration, Rating = dto.Rating,
            ReleaseDate = dto.ReleaseDate, EndDate = dto.EndDate,
            Synopsis = dto.Synopsis, Director = dto.Director, Cast = dto.Cast, TrailerUrl = dto.TrailerUrl
        };
        _db.Movies.Add(movie);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = movie.Id }, movie);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] MovieUpdateDto dto)
    {
        var movie = await _db.Movies.FindAsync(id);
        if (movie == null) return NotFound();

        movie.Title = dto.Title; movie.PosterUrl = dto.PosterUrl; movie.BackdropUrl = dto.BackdropUrl;
        movie.Genre = dto.Genre; movie.Duration = dto.Duration; movie.Rating = dto.Rating;
        movie.ReleaseDate = dto.ReleaseDate; movie.EndDate = dto.EndDate;
        movie.Synopsis = dto.Synopsis; movie.Director = dto.Director; movie.Cast = dto.Cast;
        movie.TrailerUrl = dto.TrailerUrl;

        await _db.SaveChangesAsync();
        return Ok(movie);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var movie = await _db.Movies.FindAsync(id);
        if (movie == null) return NotFound();
        _db.Movies.Remove(movie);
        await _db.SaveChangesAsync();
        return NoContent();
    }


}
