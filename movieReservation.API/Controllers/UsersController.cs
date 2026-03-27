using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReservation.Data;
using MovieReservation.DTOs;

namespace MovieReservation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    public UsersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? role)
    {
        var query = _db.Users.AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(u => u.Status == status);
        if (!string.IsNullOrEmpty(role)) query = query.Where(u => u.Role == role);

        var users = await query.OrderBy(u => u.Name).ToListAsync();
        return Ok(users.Select(u => new UserResponse(u.Id, u.Name, u.Email, u.Phone, u.Role, u.Status, u.CreatedAt)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var u = await _db.Users.FindAsync(id);
        if (u == null) return NotFound();
        return Ok(new UserResponse(u.Id, u.Name, u.Email, u.Phone, u.Role, u.Status, u.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UserUpdateDto dto)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.Name = dto.Name; user.Email = dto.Email; user.Phone = dto.Phone;
        user.Role = dto.Role; user.Status = dto.Status;
        await _db.SaveChangesAsync();
        return Ok(new UserResponse(user.Id, user.Name, user.Email, user.Phone, user.Role, user.Status, user.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
