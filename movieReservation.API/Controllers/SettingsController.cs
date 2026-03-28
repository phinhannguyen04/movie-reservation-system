using Microsoft.AspNetCore.Mvc;
using MovieReservation.Data;

namespace MovieReservation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SettingsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "operational", version = "1.0.0" });
    }
}

