using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReservation.Data;
using MovieReservation.DTOs;
using MovieReservation.Models;

namespace MovieReservation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CinemasController : ControllerBase
{
    private readonly AppDbContext _db;
    public CinemasController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cinemas = await _db.Cinemas.Include(c => c.Rooms).OrderBy(c => c.Name).ToListAsync();
        return Ok(cinemas.Select(c => new CinemaResponse(
            c.Id, c.Name, c.Address, c.Distance,
            c.Rooms.Select(r => new RoomResponse(r.Id, r.Name, r.Capacity, r.Format, r.CinemaId)).ToList())));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var c = await _db.Cinemas.Include(x => x.Rooms).FirstOrDefaultAsync(x => x.Id == id);
        if (c == null) return NotFound();
        return Ok(new CinemaResponse(c.Id, c.Name, c.Address, c.Distance,
            c.Rooms.Select(r => new RoomResponse(r.Id, r.Name, r.Capacity, r.Format, r.CinemaId)).ToList()));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CinemaCreateDto dto)
    {
        var cinema = new Cinema { Name = dto.Name, Address = dto.Address, Distance = dto.Distance ?? "0 km" };
        _db.Cinemas.Add(cinema);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cinema.Id }, cinema);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CinemaUpdateDto dto)
    {
        var cinema = await _db.Cinemas.FindAsync(id);
        if (cinema == null) return NotFound();
        cinema.Name = dto.Name; cinema.Address = dto.Address; cinema.Distance = dto.Distance ?? cinema.Distance;
        await _db.SaveChangesAsync();
        return Ok(cinema);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var cinema = await _db.Cinemas.FindAsync(id);
        if (cinema == null) return NotFound();
        _db.Cinemas.Remove(cinema);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Room endpoints nested under cinema ───────────────
    [HttpGet("{cinemaId}/rooms")]
    public async Task<IActionResult> GetRooms(Guid cinemaId)
    {
        var rooms = await _db.Rooms.Where(r => r.CinemaId == cinemaId).ToListAsync();
        return Ok(rooms.Select(r => new RoomResponse(r.Id, r.Name, r.Capacity, r.Format, r.CinemaId)));
    }

    [HttpPost("{cinemaId}/rooms")]
    public async Task<IActionResult> AddRoom(Guid cinemaId, [FromBody] RoomCreateDto dto)
    {
        if (!await _db.Cinemas.AnyAsync(c => c.Id == cinemaId))
            return NotFound(new { message = "Cinema not found." });

        var room = new Room { Name = dto.Name, Capacity = dto.Capacity, Format = dto.Format, CinemaId = cinemaId };
        _db.Rooms.Add(room);
        await _db.SaveChangesAsync();
        return Ok(new RoomResponse(room.Id, room.Name, room.Capacity, room.Format, room.CinemaId));
    }

    [HttpDelete("{cinemaId}/rooms/{roomId}")]
    public async Task<IActionResult> DeleteRoom(Guid cinemaId, Guid roomId)
    {
        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.Id == roomId && r.CinemaId == cinemaId);
        if (room == null) return NotFound();
        _db.Rooms.Remove(room);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
