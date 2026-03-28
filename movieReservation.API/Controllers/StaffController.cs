using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReservation.Data;
using MovieReservation.DTOs;
using MovieReservation.Models;

namespace MovieReservation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly AppDbContext _db;
    public StaffController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var staff = await _db.Staff.OrderBy(s => s.Name).ToListAsync();
        return Ok(staff.Select(s => new StaffResponse(s.Id, s.Name, s.Email, s.Avatar, s.Role, s.Status, s.CreatedAt)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var s = await _db.Staff.FindAsync(id);
        if (s == null) return NotFound();
        return Ok(new StaffResponse(s.Id, s.Name, s.Email, s.Avatar, s.Role, s.Status, s.CreatedAt));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] StaffCreateDto dto)
    {
        if (await _db.Staff.AnyAsync(s => s.Email == dto.Email))
            return BadRequest(new { message = "Email already in use." });

        var staff = new Staff
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role,
            Status = "active"
        };
        _db.Staff.Add(staff);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = staff.Id },
            new StaffResponse(staff.Id, staff.Name, staff.Email, staff.Avatar, staff.Role, staff.Status, staff.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] StaffUpdateDto dto)
    {
        var staff = await _db.Staff.FindAsync(id);
        if (staff == null) return NotFound();
        staff.Name = dto.Name; staff.Email = dto.Email;
        staff.Role = dto.Role; staff.Status = dto.Status;
        await _db.SaveChangesAsync();
        return Ok(new StaffResponse(staff.Id, staff.Name, staff.Email, staff.Avatar, staff.Role, staff.Status, staff.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var staff = await _db.Staff.FindAsync(id);
        if (staff == null) return NotFound();
        _db.Staff.Remove(staff);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
