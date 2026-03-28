namespace MovieReservation.DTOs;

// ── Movie DTOs ───────────────────────────────────────────────
public record MovieCreateDto(
    string Title, string PosterUrl, string BackdropUrl,
    List<string> Genre, int Duration, string Rating,
    DateTime ReleaseDate, DateTime? EndDate,
    string Synopsis, string Director, List<string> Cast, string? TrailerUrl);

public record MovieUpdateDto(
    string Title, string PosterUrl, string BackdropUrl,
    List<string> Genre, int Duration, string Rating,
    DateTime ReleaseDate, DateTime? EndDate,
    string Synopsis, string Director, List<string> Cast, string? TrailerUrl);

public record MovieResponse(
    Guid Id, string Title, string PosterUrl, string BackdropUrl,
    List<string> Genre, int Duration, string Rating,
    DateTime ReleaseDate, DateTime? EndDate,
    string Synopsis, string Director, List<string> Cast, string? TrailerUrl);

// ── Cinema DTOs ──────────────────────────────────────────────
public record CinemaCreateDto(string Name, string Address, string? Distance);
public record CinemaUpdateDto(string Name, string Address, string? Distance);
public record CinemaResponse(Guid Id, string Name, string Address, string Distance, List<RoomResponse> Rooms);

// ── Room DTOs ────────────────────────────────────────────────
public record RoomCreateDto(string Name, int Capacity, string Format);
public record RoomResponse(Guid Id, string Name, int Capacity, string Format, Guid CinemaId);

// ── Showtime DTOs ────────────────────────────────────────────
public record ShowtimeCreateDto(Guid MovieId, Guid CinemaId, DateTime Date, string Time, string Screen, string Format);
public record ShowtimeUpdateDto(Guid MovieId, Guid CinemaId, DateTime Date, string Time, string Screen, string Format);
public record ShowtimeResponse(
    Guid Id, Guid MovieId, Guid CinemaId, DateTime Date, string Time, string Screen, string Format,
    string MovieTitle, string CinemaName);

// ── Booking DTOs ─────────────────────────────────────────────
public record BookingCreateDto(Guid MovieId, Guid CinemaId, Guid ShowtimeId, Guid? UserId, List<string> Seats, decimal TotalPrice);
public record BookingUpdateDto(string Status);
public record BookingResponse(
    Guid Id, Guid MovieId, Guid CinemaId, Guid ShowtimeId, Guid? UserId,
    List<string> Seats, decimal TotalPrice, DateTime BookingDate, string Status,
    string MovieTitle, string CinemaName, string ShowtimeTime);

// ── User DTOs ────────────────────────────────────────────────
public record UserUpdateDto(string Name, string Email, string? Phone, string Role, string Status);
public record UserResponse(Guid Id, string Name, string Email, string? Phone, string Role, string Status, DateTime CreatedAt);

// ── Staff DTOs ───────────────────────────────────────────────
public record StaffCreateDto(string Name, string Email, string Password, string Role);
public record StaffUpdateDto(string Name, string Email, string Role, string Status);
public record StaffResponse(Guid Id, string Name, string Email, string? Avatar, string Role, string Status, DateTime CreatedAt);

// ── Auth DTOs ────────────────────────────────────────────────
public record LoginDto(string Email, string Password);
public record RegisterDto(string Name, string Email, string Password, string? Phone);
public record AuthResponse(string Id, string Token, string Name, string Email, string Role, string? Avatar, List<string> Permissions);

// ── Pagination DTOs ──────────────────────────────────────────
public record PaginationParams
{
    private const int MaxPageSize = 50;
    public int PageNumber { get; set; } = 1;

    private int _pageSize = 10;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }
}

public record PagedResponse<T>(
    List<T> Items,
    int TotalCount,
    int PageNumber,
    int PageSize)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
