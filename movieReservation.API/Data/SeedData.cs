using MovieReservation.Models;

namespace MovieReservation.Data;

public static class SeedData
{
    // Fixed GUIDs for relational consistency
    private static readonly Guid MovieInception = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000001");
    private static readonly Guid MovieDarkKnight = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000002");
    private static readonly Guid MovieInterstellar = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000003");
    private static readonly Guid MovieSpiderVerse = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000004");
    private static readonly Guid MovieDune2 = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000005");
    private static readonly Guid MovieOppenheimer = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000006");

    private static readonly Guid CinemaDowntown = Guid.Parse("b1b2c3d4-0002-0002-0002-000000000001");
    private static readonly Guid CinemaMall = Guid.Parse("b1b2c3d4-0002-0002-0002-000000000002");
    private static readonly Guid CinemaImax = Guid.Parse("b1b2c3d4-0002-0002-0002-000000000003");

    private static readonly Guid RoomDt1 = Guid.Parse("c1b2c3d4-0003-0003-0003-000000000001");
    private static readonly Guid RoomDt2 = Guid.Parse("c1b2c3d4-0003-0003-0003-000000000002");
    private static readonly Guid RoomDt3 = Guid.Parse("c1b2c3d4-0003-0003-0003-000000000003");
    private static readonly Guid RoomMl1 = Guid.Parse("c1b2c3d4-0003-0003-0003-000000000004");
    private static readonly Guid RoomMl2 = Guid.Parse("c1b2c3d4-0003-0003-0003-000000000005");
    private static readonly Guid RoomIm1 = Guid.Parse("c1b2c3d4-0003-0003-0003-000000000006");

    private static readonly Guid St1 = Guid.Parse("d1b2c3d4-0004-0004-0004-000000000001");
    private static readonly Guid St2 = Guid.Parse("d1b2c3d4-0004-0004-0004-000000000002");
    private static readonly Guid St3 = Guid.Parse("d1b2c3d4-0004-0004-0004-000000000003");
    private static readonly Guid St4 = Guid.Parse("d1b2c3d4-0004-0004-0004-000000000004");
    private static readonly Guid St5 = Guid.Parse("d1b2c3d4-0004-0004-0004-000000000005");
    private static readonly Guid St6 = Guid.Parse("d1b2c3d4-0004-0004-0004-000000000006");

    private static readonly Guid User1 = Guid.Parse("e1b2c3d4-0005-0005-0005-000000000001");
    private static readonly Guid User2 = Guid.Parse("e1b2c3d4-0005-0005-0005-000000000002");
    private static readonly Guid User3 = Guid.Parse("e1b2c3d4-0005-0005-0005-000000000003");

    private static readonly Guid StaffAdmin = Guid.Parse("f1b2c3d4-0006-0006-0006-000000000001");
    private static readonly Guid StaffManager = Guid.Parse("f1b2c3d4-0006-0006-0006-000000000002");
    private static readonly Guid StaffBox = Guid.Parse("f1b2c3d4-0006-0006-0006-000000000003");

    public static async Task Initialize(AppDbContext context)
    {
        // Only seed if DB is empty
        if (context.Movies.Any()) return;

        // ── Movies (real data) ───────────────────────────
        var movies = new List<Movie>
        {
            new()
            {
                Id = MovieInception,
                Title = "Inception",
                PosterUrl = "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
                BackdropUrl = "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
                Genre = new List<string> { "Action", "Sci-Fi", "Thriller" },
                Duration = 148,
                Rating = "PG-13",
                ReleaseDate = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc),
                Synopsis = "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                Director = "Christopher Nolan",
                Cast = new List<string> { "Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy" },
                TrailerUrl = "https://www.youtube.com/watch?v=YoHD9XEInc0"
            },
            new()
            {
                Id = MovieDarkKnight,
                Title = "The Dark Knight",
                PosterUrl = "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe1nNaD3.jpg",
                BackdropUrl = "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg",
                Genre = new List<string> { "Action", "Crime", "Drama" },
                Duration = 152,
                Rating = "PG-13",
                ReleaseDate = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 4, 30, 0, 0, 0, DateTimeKind.Utc),
                Synopsis = "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                Director = "Christopher Nolan",
                Cast = new List<string> { "Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine" },
                TrailerUrl = "https://www.youtube.com/watch?v=EXeTwQWrcwY"
            },
            new()
            {
                Id = MovieInterstellar,
                Title = "Interstellar",
                PosterUrl = "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                BackdropUrl = "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK1DVfjko.jpg",
                Genre = new List<string> { "Adventure", "Drama", "Sci-Fi" },
                Duration = 169,
                Rating = "PG-13",
                ReleaseDate = new DateTime(2026, 3, 20, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 6, 15, 0, 0, 0, DateTimeKind.Utc),
                Synopsis = "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth becomes uninhabitable.",
                Director = "Christopher Nolan",
                Cast = new List<string> { "Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine" },
                TrailerUrl = "https://www.youtube.com/watch?v=zSWdZVtXT7E"
            },
            new()
            {
                Id = MovieSpiderVerse,
                Title = "Spider-Man: Across the Spider-Verse",
                PosterUrl = "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
                BackdropUrl = "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
                Genre = new List<string> { "Animation", "Action", "Adventure" },
                Duration = 140,
                Rating = "PG",
                ReleaseDate = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc),
                Synopsis = "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
                Director = "Joaquim Dos Santos",
                Cast = new List<string> { "Shameik Moore", "Hailee Steinfeld", "Oscar Isaac", "Jake Johnson" },
                TrailerUrl = "https://www.youtube.com/watch?v=shW9i6k8cB0"
            },
            new()
            {
                Id = MovieDune2,
                Title = "Dune: Part Two",
                PosterUrl = "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
                BackdropUrl = "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
                Genre = new List<string> { "Sci-Fi", "Adventure", "Drama" },
                Duration = 166,
                Rating = "PG-13",
                ReleaseDate = new DateTime(2026, 3, 10, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc),
                Synopsis = "Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe.",
                Director = "Denis Villeneuve",
                Cast = new List<string> { "Timothée Chalamet", "Zendaya", "Austin Butler", "Florence Pugh" },
                TrailerUrl = "https://www.youtube.com/watch?v=Way9Dexny3w"
            },
            new()
            {
                Id = MovieOppenheimer,
                Title = "Oppenheimer",
                PosterUrl = "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
                BackdropUrl = "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
                Genre = new List<string> { "Drama", "History", "Thriller" },
                Duration = 180,
                Rating = "R",
                ReleaseDate = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 4, 15, 0, 0, 0, DateTimeKind.Utc),
                Synopsis = "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
                Director = "Christopher Nolan",
                Cast = new List<string> { "Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr." },
                TrailerUrl = "https://www.youtube.com/watch?v=uYPbbksJxIg"
            }
        };
        context.Movies.AddRange(movies);

        // ── Cinemas ──────────────────────────────────────
        var cinemas = new List<Cinema>
        {
            new() { Id = CinemaDowntown, Name = "Cinemax Downtown", Address = "123 Main St, City Center", Distance = "1.2 km" },
            new() { Id = CinemaMall, Name = "Cinemax Mall", Address = "456 Shopping Ave, Westside", Distance = "3.5 km" },
            new() { Id = CinemaImax, Name = "Cinemax IMAX Theater", Address = "789 Entertainment Blvd, Eastside", Distance = "5.0 km" },
        };
        context.Cinemas.AddRange(cinemas);

        // ── Rooms ────────────────────────────────────────
        var rooms = new List<Room>
        {
            new() { Id = RoomDt1, Name = "Screen 1", Capacity = 120, Format = "2D", CinemaId = CinemaDowntown },
            new() { Id = RoomDt2, Name = "Screen 2", Capacity = 80, Format = "3D", CinemaId = CinemaDowntown },
            new() { Id = RoomDt3, Name = "Screen 3", Capacity = 200, Format = "IMAX", CinemaId = CinemaDowntown },
            new() { Id = RoomMl1, Name = "Hall A", Capacity = 100, Format = "2D", CinemaId = CinemaMall },
            new() { Id = RoomMl2, Name = "Hall B", Capacity = 60, Format = "3D", CinemaId = CinemaMall },
            new() { Id = RoomIm1, Name = "IMAX 1", Capacity = 300, Format = "IMAX", CinemaId = CinemaImax },
        };
        context.Rooms.AddRange(rooms);

        // ── Showtimes ────────────────────────────────────
        var baseDate = new DateTime(2026, 3, 28, 0, 0, 0, DateTimeKind.Utc);
        var showtimes = new List<Showtime>
        {
            new() { Id = St1, MovieId = MovieInception, CinemaId = CinemaDowntown, Date = baseDate, Time = "10:00", Screen = "Screen 1", Format = "2D" },
            new() { Id = St2, MovieId = MovieInception, CinemaId = CinemaDowntown, Date = baseDate, Time = "14:30", Screen = "Screen 3", Format = "IMAX" },
            new() { Id = St3, MovieId = MovieDarkKnight, CinemaId = CinemaMall, Date = baseDate, Time = "11:00", Screen = "Hall A", Format = "2D" },
            new() { Id = St4, MovieId = MovieInterstellar, CinemaId = CinemaImax, Date = baseDate, Time = "19:00", Screen = "IMAX 1", Format = "IMAX" },
            new() { Id = St5, MovieId = MovieDune2, CinemaId = CinemaDowntown, Date = baseDate.AddDays(1), Time = "16:00", Screen = "Screen 2", Format = "3D" },
            new() { Id = St6, MovieId = MovieOppenheimer, CinemaId = CinemaMall, Date = baseDate.AddDays(1), Time = "20:00", Screen = "Hall B", Format = "3D" },
        };
        context.Showtimes.AddRange(showtimes);

        // ── Users ────────────────────────────────────────
        var users = new List<User>
        {
            new()
            {
                Id = User1, Name = "John Doe", Email = "user@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Phone = "+1 234 567 8900", Role = "customer", Status = "active"
            },
            new()
            {
                Id = User2, Name = "Alice Smith", Email = "alice@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Phone = "+1 987 654 3210", Role = "customer", Status = "active"
            },
            new()
            {
                Id = User3, Name = "Bob Johnson", Email = "bob@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Phone = "+1 555 123 4567", Role = "customer", Status = "locked"
            },
        };
        context.Users.AddRange(users);

        // ── Staff ────────────────────────────────────────
        var staff = new List<Staff>
        {
            new()
            {
                Id = StaffAdmin, Name = "System Admin", Email = "admin@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = "admin", Status = "active",
                Avatar = "https://i.pravatar.cc/150?u=admin"
            },
            new()
            {
                Id = StaffManager, Name = "Cinema Manager", Email = "manager@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"),
                Role = "manager", Status = "active",
                Avatar = "https://i.pravatar.cc/150?u=manager"
            },
            new()
            {
                Id = StaffBox, Name = "Box Office Staff", Email = "staff@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("staff123"),
                Role = "staff", Status = "active",
                Avatar = "https://i.pravatar.cc/150?u=staff"
            },
        };
        context.Staff.AddRange(staff);

        // ── Bookings ─────────────────────────────────────
        var bookings = new List<Booking>
        {
            new()
            {
                MovieId = MovieInception, CinemaId = CinemaDowntown, ShowtimeId = St1, UserId = User1,
                Seats = new List<string> { "A1", "A2" }, TotalPrice = 24.00m,
                BookingDate = DateTime.UtcNow.AddDays(-2), Status = "confirmed"
            },
            new()
            {
                MovieId = MovieDarkKnight, CinemaId = CinemaMall, ShowtimeId = St3, UserId = User2,
                Seats = new List<string> { "C5", "C6", "C7" }, TotalPrice = 36.00m,
                BookingDate = DateTime.UtcNow.AddDays(-1), Status = "confirmed"
            },
            new()
            {
                MovieId = MovieInterstellar, CinemaId = CinemaImax, ShowtimeId = St4, UserId = User1,
                Seats = new List<string> { "D3" }, TotalPrice = 18.00m,
                BookingDate = DateTime.UtcNow, Status = "confirmed"
            },
            new()
            {
                MovieId = MovieInception, CinemaId = CinemaDowntown, ShowtimeId = St2, UserId = User3,
                Seats = new List<string> { "B4", "B5" }, TotalPrice = 32.00m,
                BookingDate = DateTime.UtcNow.AddDays(-3), Status = "cancelled"
            },
        };
        context.Bookings.AddRange(bookings);

        // ── System Settings (default) ────────────────────
        context.SystemSettings.Add(new SystemSettings
        {
            SmtpHost = "smtp.gmail.com",
            SmtpPort = 587,
            EnableSsl = true,
            EmailEnabled = false,
            WelcomeEmailSubject = "Welcome to Movie Reservation! 🎬",
            WelcomeEmailTemplate = @"
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 12px; overflow: hidden;'>
    <div style='background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;'>
        <h1 style='color: white; margin: 0; font-size: 24px;'>🎬 Welcome to Movie Reservation!</h1>
    </div>
    <div style='padding: 32px;'>
        <p style='font-size: 16px;'>Hello <strong>{{name}}</strong>,</p>
        <p>Your account has been created successfully. Here are your login details:</p>
        <div style='background: #16213e; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #6366f1;'>
            <p style='margin: 4px 0;'><strong>Email:</strong> {{email}}</p>
            <p style='margin: 4px 0;'><strong>Password:</strong> {{password}}</p>
        </div>
        <p style='color: #f59e0b; font-size: 14px;'>⚠️ Please change your password after first login for security.</p>
        <div style='text-align: center; margin-top: 24px;'>
            <a href='http://localhost:5173/login' style='display: inline-block; background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;'>Login Now</a>
        </div>
    </div>
    <div style='background: #0f0f23; padding: 16px; text-align: center; font-size: 12px; color: #666;'>
        © 2026 Movie Reservation System
    </div>
</div>",
            BookingEmailSubject = "🎟️ Booking Confirmed!",
            BookingEmailTemplate = @"
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 12px; overflow: hidden;'>
    <div style='background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;'>
        <h1 style='color: white; margin: 0; font-size: 24px;'>🎟️ Booking Confirmed!</h1>
    </div>
    <div style='padding: 32px;'>
        <p style='font-size: 16px;'>Hello <strong>{{customerName}}</strong>,</p>
        <p>Your ticket booking has been confirmed! Here are the details:</p>
        <div style='background: #16213e; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #22c55e;'>
            <p style='margin: 6px 0;'>🎬 <strong>Movie:</strong> {{movieTitle}}</p>
            <p style='margin: 6px 0;'>🏢 <strong>Cinema:</strong> {{cinemaName}}</p>
            <p style='margin: 6px 0;'>📺 <strong>Screen:</strong> {{screen}}</p>
            <p style='margin: 6px 0;'>📅 <strong>Date:</strong> {{date}}</p>
            <p style='margin: 6px 0;'>🕐 <strong>Time:</strong> {{time}}</p>
            <p style='margin: 6px 0;'>💺 <strong>Seats:</strong> {{seats}}</p>
            <p style='margin: 6px 0; font-size: 18px; color: #22c55e;'>💰 <strong>Total: ${{totalPrice}}</strong></p>
        </div>
        <div style='background: #1e1e3a; border-radius: 8px; padding: 12px; text-align: center; margin-top: 16px;'>
            <p style='margin: 0; font-size: 12px; color: #888;'>Booking ID</p>
            <p style='margin: 4px 0; font-size: 14px; font-family: monospace; color: #6366f1;'>{{bookingId}}</p>
        </div>
        <p style='margin-top: 20px; font-size: 14px; color: #888;'>Please arrive 15 minutes before showtime. Show this email or your booking ID at the counter.</p>
        <div style='text-align: center; margin-top: 15px;'>
             <img src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{bookingId}}' width='150' alt='QR Code' />
        </div>
    </div>
    <div style='background: #0f0f23; padding: 16px; text-align: center; font-size: 12px; color: #666;'>
        © 2026 Movie Reservation System
    </div>
</div>",
            StaffInviteEmailSubject = "🎬 Welcome to the Cinemax Team!",
            StaffInviteEmailTemplate = @"
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 12px; overflow: hidden;'>
    <div style='background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px; text-align: center;'>
        <h1 style='color: white; margin: 0; font-size: 24px;'>🛡️ New Role Assignment</h1>
    </div>
    <div style='padding: 32px;'>
        <p style='font-size: 16px;'>Hello <strong>{{name}}</strong>,</p>
        <p>You have been assigned the <strong>{{role}}</strong> role in the Movie Reservation System. This gives you access to specific administrative modules.</p>
        <div style='background: #16213e; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;'>
            <p style='margin: 4px 0;'><strong>Username:</strong> {{email}}</p>
            <p style='margin: 4px 0;'><strong>Temporary Password:</strong> {{password}}</p>
        </div>
        <p style='font-size: 14px; color: #888; border-top: 1px solid #ffffff10; padding-top: 16px;'>As a <strong>{{role}}</strong>, you can now manage specific aspects of the platform based on your permissions.</p>
        <div style='text-align: center; margin-top: 24px;'>
            <a href='http://localhost:5173/admin' style='display: inline-block; background: #f59e0b; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;'>Go to Dashboard</a>
        </div>
    </div>
    <div style='background: #0f0f23; padding: 16px; text-align: center; font-size: 12px; color: #666;'>
        © 2026 Movie Reservation System
    </div>
</div>"
        });

        await context.SaveChangesAsync();
    }
}
