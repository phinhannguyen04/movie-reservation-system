using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReservation.Data;
using MovieReservation.DTOs;
using MovieReservation.Models;
using MovieReservation.Services;

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
    public async Task<IActionResult> Create([FromBody] StaffCreateDto dto, [FromServices] EmailService emailService)
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

        // Send Invitation Email
        var settings = await _db.SystemSettings.FirstOrDefaultAsync();
        var subject = settings?.StaffInviteEmailSubject ?? "Cinemax: You've been invited as Staff!";
        var body = settings?.StaffInviteEmailTemplate;

        if (string.IsNullOrWhiteSpace(body))
        {
            body = $@"
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e0e0e0; border-radius: 12px; overflow: hidden; border: 1px solid #222;'>
    <div style='background: linear-gradient(135deg, #e50914, #b20710); padding: 32px; text-align: center;'>
        <h1 style='color: white; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;'>
            STAFF INVITATION
        </h1>
    </div>
    <div style='padding: 32px;'>
        <p style='font-size: 16px; color: #ffffff;'>Dear <strong>{{name}}</strong>,</p>
        <p style='color: #a3a3a3; line-height: 1.5;'>You have been added to the Cinemax system as a staff member by the administrator.</p>
        
        <div style='background: #141414; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #e50914; box-shadow: 0 4px 15px rgba(0,0,0,0.5);'>
            <p style='margin: 8px 0; font-size: 15px;'><strong>System Role:</strong> <span style='color: #e50914; font-weight: bold; text-transform: uppercase;'>{{role}}</span></p>
            <p style='margin: 8px 0; font-size: 15px;'><strong>Login Email:</strong> <span style='color: #ffffff;'>{{email}}</span></p>
            <p style='margin: 8px 0; font-size: 15px;'><strong>Temporary Password:</strong> <span style='color: #ffffff; font-family: monospace;'>{{password}}</span></p>
        </div>
        
        <p style='color: #f59e0b; font-size: 13px;'>⚠️ For security reasons, please change your password immediately after logging in for the first time.</p>
        
        <div style='text-align: center; margin-top: 32px; margin-bottom: 16px;'>
            <a href='http://localhost:5173/admin' style='display: inline-block; background: #e50914; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4);'>
                ACCESS ADMIN PANEL
            </a>
        </div>
    </div>
    <div style='background: #050505; border-top: 1px solid #1a1a1a; padding: 20px; text-align: center; font-size: 12px; color: #666;'>
        © 2026 Cinemax Reservation System. <br/>Internal Staff Communication.
    </div>
</div>";
        }

        body = body.Replace("{{name}}", staff.Name)
                   .Replace("{{email}}", staff.Email)
                   .Replace("{{password}}", dto.Password)
                   .Replace("{{role}}", staff.Role);

        await emailService.SendEmailAsync(staff.Email, staff.Name, subject, body);

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
