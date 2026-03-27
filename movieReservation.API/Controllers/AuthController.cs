using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MovieReservation.Data;
using MovieReservation.DTOs;
using MovieReservation.Services;

namespace MovieReservation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly EmailService _emailService;

    public AuthController(AppDbContext db, IConfiguration config, EmailService emailService)
    {
        _db = db;
        _config = config;
        _emailService = emailService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // Check staff first
        var staff = await _db.Staff.FirstOrDefaultAsync(s => s.Email == dto.Email);
        if (staff != null && BCrypt.Net.BCrypt.Verify(dto.Password, staff.PasswordHash))
        {
            var permissions = GetPermissions(staff.Role);
            var token = GenerateToken(staff.Id.ToString(), staff.Email, staff.Role, staff.Name);
            return Ok(new AuthResponse(token, staff.Name, staff.Email, staff.Role, staff.Avatar, permissions));
        }

        // Check user
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user != null && BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            if (user.Status == "locked")
                return BadRequest(new { message = "Account is locked. Contact admin." });

            var token = GenerateToken(user.Id.ToString(), user.Email, user.Role, user.Name);
            return Ok(new AuthResponse(token, user.Name, user.Email, user.Role, user.Avatar, new List<string>()));
        }

        return Unauthorized(new { message = "Invalid email or password." });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email already registered." });

        var user = new Models.User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone,
            Role = "customer",
            Status = "active"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Send welcome email with password
        _ = _emailService.SendWelcomeEmail(user.Email, user.Name, dto.Password);

        var token = GenerateToken(user.Id.ToString(), user.Email, user.Role, user.Name);
        return Ok(new AuthResponse(token, user.Name, user.Email, user.Role, user.Avatar, new List<string>()));
    }

    private string GenerateToken(string id, string email, string role, string name)
    {
        var jwt = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, id),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(ClaimTypes.Name, name)
        };

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(jwt["ExpirationInMinutes"]!)),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static List<string> GetPermissions(string role) => role switch
    {
        "admin" => new List<string> { "dashboard", "movies", "cinemas", "showtimes", "tickets", "users", "staff", "settings" },
        "manager" => new List<string> { "dashboard", "movies", "cinemas", "showtimes", "tickets" },
        "staff" => new List<string> { "dashboard", "tickets" },
        _ => new List<string>()
    };
}
