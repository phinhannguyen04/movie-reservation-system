using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using MovieReservation.Data;
using MovieReservation.Models;
using System.Text.Json;

namespace MovieReservation.Scripts;

class Program
{
    static async System.Threading.Tasks.Task Main(string[] args)
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(System.IO.Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql(config.GetConnectionString("DefaultConnection"));

        using var db = new AppDbContext(optionsBuilder.Options);

        var bookings = await db.Bookings.AsNoTracking().ToListAsync();
        
        Console.WriteLine($"Total Bookings: {bookings.Count}");
        foreach (var b in bookings)
        {
            Console.WriteLine($"ID: {b.Id}, Movie: {b.MovieTitle}, Cinema: {b.CinemaName}, Time: {b.Showtime}, Screen: {b.Screen}, Date: {b.BookingDate:yyyy-MM-dd HH:mm:ss}, Seats: {string.Join(",", b.Seats)}, Status: {b.Status}");
        }
    }
}
