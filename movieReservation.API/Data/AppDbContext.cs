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
    public DbSet<ShowTimeSeatPrice> ShowTimeSeatPrices => Set<ShowTimeSeatPrice>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Movie ─────────────────────────────────────────
        modelBuilder.Entity<Movie>(e =>
        {
            e.HasIndex(m => m.Title);
            e.HasIndex(m => m.ReleaseDate);
            e.HasIndex(m => m.Rating);
            e.Property(m => m.Genre).HasColumnType("text[]");
            e.Property(m => m.Cast).HasColumnType("text[]");
        });

        // ── Cinema → Rooms ────────────────────────────────
        modelBuilder.Entity<Cinema>()
            .HasMany(c => c.Rooms)
            .WithOne(r => r.Cinema)
            .HasForeignKey(r => r.CinemaId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // ── ShowtimeSeatPrice (Pricing per Category per Showtime) ────────
        modelBuilder.Entity<ShowTimeSeatPrice>(e =>
        {
            /* 
             * Logic: Each seat category in a showtime must have exactly ONE unique price.
             * This unique index prevents duplicate price entries for the same category in a single showtime.
             * 
             * Valid Scenario:
             *   - Showtime A | Standard | 100,000 VND 
             *   - Showtime A | VIP      | 200,000 VND
             * 
             * Invalid Scenario (Will throw error):
             *   - Showtime A | Standard | 50,000 VND (Because Showtime A already has a Standard price)
             */
            e.HasIndex(sp => new { sp.ShowtimeId, sp.Category }).IsUnique();

            e.HasOne(sp => sp.Showtime)
                .WithMany()
                .HasForeignKey(sp => sp.ShowtimeId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Store Enum as string for better readability in DB
            e.Property(sp => sp.Category).HasConversion<string>();
            
            // Decimal formatting for currency
            e.Property(sp => sp.Price).HasColumnType("decimal(10,2)");
        });

        // ── Showtime → Movie, Cinema, ShowtimePrice ──────────────────────
        modelBuilder.Entity<Showtime>()
            .HasOne(s => s.Movie)
            .WithMany(m => m.Showtimes)
            .HasForeignKey(s => s.MovieId);

        modelBuilder.Entity<Showtime>()
            .HasOne(s => s.Cinema)
            .WithMany(c => c.Showtimes)
            .HasForeignKey(s => s.CinemaId);

        modelBuilder.Entity<Showtime>()
            .HasIndex(s => new { s.MovieId, s.Date });

        
        // ── Booking → Movie, Cinema, Showtime, User ──────
        modelBuilder.Entity<Booking>(e =>
        {
            e.Property(b => b.Seats).HasColumnType("text[]");
            e.Property(b => b.TotalPrice).HasColumnType("decimal(10,2)");
            
            // Scalability Indices
            e.HasIndex(b => b.UserId);
            
            // Loose relationship mapping (No physical FK in DB)
            // This allows UserId to store IDs from Users OR Staff
            e.HasOne(b => b.User)
             .WithMany(u => u.Bookings)
             .HasForeignKey(b => b.UserId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.NoAction);

            e.HasIndex(b => b.BookingDate);
            e.HasIndex(b => new { b.MovieTitle, b.CinemaName, b.Showtime, b.Screen, b.BookingDate });
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
