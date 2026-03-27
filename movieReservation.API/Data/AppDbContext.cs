using Microsoft.EntityFrameworkCore;
using MovieReservation.Models;

namespace MovieReservation.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Cinema> Cinemas => Set<Cinema>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Showtime> Showtimes => Set<Showtime>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Staff> Staff => Set<Staff>();
    public DbSet<SystemSettings> SystemSettings => Set<SystemSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Movie ─────────────────────────────────────────
        modelBuilder.Entity<Movie>(e =>
        {
            e.HasIndex(m => m.Title);
            e.Property(m => m.Genre).HasColumnType("text[]");
            e.Property(m => m.Cast).HasColumnType("text[]");
        });

        // ── Cinema → Rooms ────────────────────────────────
        modelBuilder.Entity<Cinema>()
            .HasMany(c => c.Rooms)
            .WithOne(r => r.Cinema)
            .HasForeignKey(r => r.CinemaId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Showtime → Movie, Cinema ──────────────────────
        modelBuilder.Entity<Showtime>()
            .HasOne(s => s.Movie)
            .WithMany(m => m.Showtimes)
            .HasForeignKey(s => s.MovieId);

        modelBuilder.Entity<Showtime>()
            .HasOne(s => s.Cinema)
            .WithMany(c => c.Showtimes)
            .HasForeignKey(s => s.CinemaId);

        // ── Booking → Movie, Cinema, Showtime, User ──────
        modelBuilder.Entity<Booking>(e =>
        {
            e.Property(b => b.Seats).HasColumnType("text[]");
            e.Property(b => b.TotalPrice).HasColumnType("decimal(10,2)");
        });

        // ── User unique email ─────────────────────────────
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Staff>()
            .HasIndex(s => s.Email)
            .IsUnique();
    }
}
