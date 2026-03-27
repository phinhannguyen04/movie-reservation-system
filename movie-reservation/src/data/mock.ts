export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  genre: string[];
  duration: number; // minutes
  rating: string;
  releaseDate: string;
  endDate?: string;
  synopsis: string;
  director: string;
  cast: string[];
  trailerUrl?: string;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  distance: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;       // e.g. "Screen 1", "IMAX Hall"
  capacity: number;
  format: '2D' | '3D' | 'IMAX';
}

export interface Showtime {
  id: string;
  cinemaId: string;
  movieId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  screen: string;
  format: '2D' | '3D' | 'IMAX';
}

export interface Seat {
  id: string; // e.g., A1
  row: string;
  col: number;
  type: 'normal' | 'vip' | 'couple';
  status: 'available' | 'occupied';
  price: number;
}

export interface Booking {
  id: string;
  movieId: string;
  cinemaId: string;
  showtimeId: string;
  seats: string[];
  totalPrice: number;
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | 'watched';
}

export const movies: Movie[] = [
  {
    id: 'm1',
    title: 'Dune: Part Two',
    posterUrl: 'https://picsum.photos/seed/dune2/400/600',
    backdropUrl: 'https://picsum.photos/seed/dune2bg/1920/1080',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    duration: 166,
    rating: 'PG-13',
    releaseDate: '2024-03-01',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w'
  },
  {
    id: 'm2',
    title: 'Oppenheimer',
    posterUrl: 'https://picsum.photos/seed/oppenheimer/400/600',
    backdropUrl: 'https://picsum.photos/seed/oppenheimerbg/1920/1080',
    genre: ['Biography', 'Drama', 'History'],
    duration: 180,
    rating: 'R',
    releaseDate: '2023-07-21',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg'
  },
  {
    id: 'm3',
    title: 'Spider-Man: Across the Spider-Verse',
    posterUrl: 'https://picsum.photos/seed/spiderman/400/600',
    backdropUrl: 'https://picsum.photos/seed/spidermanbg/1920/1080',
    genre: ['Animation', 'Action', 'Adventure'],
    duration: 140,
    rating: 'PG',
    releaseDate: '2023-06-02',
    synopsis: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Brian Tyree Henry', 'Luna Lauren Velez'],
    trailerUrl: 'https://www.youtube.com/embed/shW9i6k8cB0'
  },
  {
    id: 'm4',
    title: 'The Batman',
    posterUrl: 'https://picsum.photos/seed/batman/400/600',
    backdropUrl: 'https://picsum.photos/seed/batmanbg/1920/1080',
    genre: ['Action', 'Crime', 'Drama'],
    duration: 176,
    rating: 'PG-13',
    releaseDate: '2022-03-04',
    synopsis: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption.',
    director: 'Matt Reeves',
    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Jeffrey Wright', 'Colin Farrell'],
    trailerUrl: 'https://www.youtube.com/embed/mqqft2x_Aa4'
  },
  {
    id: 'm5',
    title: 'Interstellar',
    posterUrl: 'https://picsum.photos/seed/interstellar/400/600',
    backdropUrl: 'https://picsum.photos/seed/interstellarbg/1920/1080',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    duration: 169,
    rating: 'PG-13',
    releaseDate: '2014-11-07',
    synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E'
  },
  {
    id: 'm6',
    title: 'Avatar: The Way of Water',
    posterUrl: 'https://picsum.photos/seed/avatar2/400/600',
    backdropUrl: 'https://picsum.photos/seed/avatar2bg/1920/1080',
    genre: ['Action', 'Adventure', 'Fantasy'],
    duration: 192,
    rating: 'PG-13',
    releaseDate: '2022-12-16',
    synopsis: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
    director: 'James Cameron',
    cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
    trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0'
  },
  {
    id: 'm7',
    title: 'John Wick: Chapter 4',
    posterUrl: 'https://picsum.photos/seed/johnwick4/400/600',
    backdropUrl: 'https://picsum.photos/seed/johnwick4bg/1920/1080',
    genre: ['Action', 'Crime', 'Thriller'],
    duration: 169,
    rating: 'R',
    releaseDate: '2023-03-24',
    synopsis: 'John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe and forces that turn old friends into foes.',
    director: 'Chad Stahelski',
    cast: ['Keanu Reeves', 'Donnie Yen', 'Bill Skarsgård', 'Laurence Fishburne'],
    trailerUrl: 'https://www.youtube.com/embed/qEVUtrk8_B4'
  },
  {
    id: 'm8',
    title: 'Top Gun: Maverick',
    posterUrl: 'https://picsum.photos/seed/topgun/400/600',
    backdropUrl: 'https://picsum.photos/seed/topgunbg/1920/1080',
    genre: ['Action', 'Drama'],
    duration: 130,
    rating: 'PG-13',
    releaseDate: '2022-05-27',
    synopsis: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN\'s elite graduates on a mission that demands the ultimate sacrifice from those chosen to fly it.',
    director: 'Joseph Kosinski',
    cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly', 'Jon Hamm'],
    trailerUrl: 'https://www.youtube.com/embed/giXco2jaZ_4'
  },
  {
    id: 'm9',
    title: 'The Matrix Resurrections',
    posterUrl: 'https://picsum.photos/seed/matrix4/400/600',
    backdropUrl: 'https://picsum.photos/seed/matrix4bg/1920/1080',
    genre: ['Action', 'Sci-Fi'],
    duration: 148,
    rating: 'R',
    releaseDate: '2021-12-22',
    synopsis: 'Return to a world of two realities: one, everyday life; the other, what lies behind it. To find out if his reality is a construct, to truly know himself, Mr. Anderson will have to choose to follow the white rabbit once more.',
    director: 'Lana Wachowski',
    cast: ['Keanu Reeves', 'Carrie-Anne Moss', 'Yahya Abdul-Mateen II', 'Jessica Henwick'],
    trailerUrl: 'https://www.youtube.com/embed/9ix7TUGVYIo'
  },
  {
    id: 'm10',
    title: 'Joker',
    posterUrl: 'https://picsum.photos/seed/joker/400/600',
    backdropUrl: 'https://picsum.photos/seed/jokerbg/1920/1080',
    genre: ['Crime', 'Drama', 'Thriller'],
    duration: 122,
    rating: 'R',
    releaseDate: '2019-10-04',
    synopsis: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego: the Joker.',
    director: 'Todd Phillips',
    cast: ['Joaquin Phoenix', 'Robert De Niro', 'Zazie Beetz', 'Frances Conroy'],
    trailerUrl: 'https://www.youtube.com/embed/zAGVQLHvwOY'
  },
  {
    id: 'm11',
    title: 'Avengers: Endgame',
    posterUrl: 'https://picsum.photos/seed/endgame/400/600',
    backdropUrl: 'https://picsum.photos/seed/endgamebg/1920/1080',
    genre: ['Action', 'Adventure', 'Drama'],
    duration: 181,
    rating: 'PG-13',
    releaseDate: '2019-04-26',
    synopsis: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
    director: 'Anthony Russo, Joe Russo',
    cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth'],
    trailerUrl: 'https://www.youtube.com/embed/TcMBFSGVi1c'
  },
  {
    id: 'm12',
    title: 'Inception',
    posterUrl: 'https://picsum.photos/seed/inception/400/600',
    backdropUrl: 'https://picsum.photos/seed/inceptionbg/1920/1080',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    duration: 148,
    rating: 'PG-13',
    releaseDate: '2010-07-16',
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0'
  },
  {
    id: 'm13',
    title: 'Deadpool & Wolverine',
    posterUrl: 'https://picsum.photos/seed/deadpool3/400/600',
    backdropUrl: 'https://picsum.photos/seed/deadpool3bg/1920/1080',
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    duration: 127,
    rating: 'R',
    releaseDate: '2026-07-26',
    synopsis: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth, Deadpool. They team up to defeat a common enemy.',
    director: 'Shawn Levy',
    cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Matthew Macfadyen'],
    trailerUrl: 'https://www.youtube.com/embed/73_1biulkYk'
  },
  {
    id: 'm14',
    title: 'Gladiator II',
    posterUrl: 'https://picsum.photos/seed/gladiator2/400/600',
    backdropUrl: 'https://picsum.photos/seed/gladiator2bg/1920/1080',
    genre: ['Action', 'Adventure', 'Drama'],
    duration: 150,
    rating: 'R',
    releaseDate: '2026-11-22',
    synopsis: 'Follows Lucius, the son of Maximus\' love Lucilla, after Maximus\' death.',
    director: 'Ridley Scott',
    cast: ['Paul Mescal', 'Denzel Washington', 'Pedro Pascal', 'Connie Nielsen'],
    trailerUrl: 'https://www.youtube.com/embed/4rgYUipGJNo'
  },
  {
    id: 'm15',
    title: 'Wicked',
    posterUrl: 'https://picsum.photos/seed/wicked/400/600',
    backdropUrl: 'https://picsum.photos/seed/wickedbg/1920/1080',
    genre: ['Fantasy', 'Musical', 'Romance'],
    duration: 160,
    rating: 'PG',
    releaseDate: '2026-11-27',
    synopsis: 'The story of how a green-skinned woman framed by the Wizard of Oz becomes the Wicked Witch of the West.',
    director: 'Jon M. Chu',
    cast: ['Cynthia Erivo', 'Ariana Grande', 'Jonathan Bailey', 'Jeff Goldblum'],
    trailerUrl: 'https://www.youtube.com/embed/6COmYeLsz4c'
  },
  {
    id: 'm16',
    title: 'Mufasa: The Lion King',
    posterUrl: 'https://picsum.photos/seed/mufasa/400/600',
    backdropUrl: 'https://picsum.photos/seed/mufasabg/1920/1080',
    genre: ['Animation', 'Adventure', 'Drama'],
    duration: 118,
    rating: 'PG',
    releaseDate: '2026-12-20',
    synopsis: 'Simba, having become king of the Pride Lands, is determined for his cub to follow in his paw prints while the origins of his late father Mufasa are explored.',
    director: 'Barry Jenkins',
    cast: ['Aaron Pierre', 'Kelvin Harrison Jr.', 'Seth Rogen', 'Billy Eichner'],
    trailerUrl: 'https://www.youtube.com/embed/lEMK0E1X_c8'
  }
];

export const cinemas: Cinema[] = [
  { id: 'c1', name: 'Cinemax Downtown', address: '123 Main St, City Center', distance: '1.2 km', rooms: [
    { id: 'r1-c1', name: 'Screen 1', capacity: 120, format: '2D' },
    { id: 'r2-c1', name: 'Screen 2', capacity: 80, format: '3D' },
    { id: 'r3-c1', name: 'Screen 3', capacity: 200, format: 'IMAX' },
  ] },
  { id: 'c2', name: 'Cinemax Mall', address: '456 Shopping Ave, Westside', distance: '3.5 km', rooms: [
    { id: 'r1-c2', name: 'Screen A', capacity: 100, format: '2D' },
    { id: 'r2-c2', name: 'Screen B', capacity: 100, format: '2D' },
    { id: 'r3-c2', name: 'Screen C', capacity: 60, format: '3D' },
  ] },
  { id: 'c3', name: 'Cinemax IMAX', address: '789 Entertainment Blvd, Eastside', distance: '5.0 km', rooms: [
    { id: 'r1-c3', name: 'IMAX 1', capacity: 300, format: 'IMAX' },
  ] },
];

// Helper to generate showtimes
export const generateShowtimes = (movieId: string, date: string): Showtime[] => {
  return [
    { id: `s1-${movieId}-${date}`, cinemaId: 'c1', movieId, date, time: '10:00', screen: 'Screen 1', format: '2D' },
    { id: `s2-${movieId}-${date}`, cinemaId: 'c1', movieId, date, time: '13:30', screen: 'Screen 2', format: '3D' },
    { id: `s3-${movieId}-${date}`, cinemaId: 'c1', movieId, date, time: '17:00', screen: 'Screen 1', format: '2D' },
    { id: `s4-${movieId}-${date}`, cinemaId: 'c1', movieId, date, time: '20:30', screen: 'Screen 3', format: 'IMAX' },
    
    { id: `s5-${movieId}-${date}`, cinemaId: 'c2', movieId, date, time: '11:15', screen: 'Screen A', format: '2D' },
    { id: `s6-${movieId}-${date}`, cinemaId: 'c2', movieId, date, time: '14:45', screen: 'Screen B', format: '2D' },
    { id: `s7-${movieId}-${date}`, cinemaId: 'c2', movieId, date, time: '18:15', screen: 'Screen A', format: '3D' },
    { id: `s8-${movieId}-${date}`, cinemaId: 'c2', movieId, date, time: '21:45', screen: 'Screen C', format: '2D' },
    
    { id: `s9-${movieId}-${date}`, cinemaId: 'c3', movieId, date, time: '12:00', screen: 'IMAX 1', format: 'IMAX' },
    { id: `s10-${movieId}-${date}`, cinemaId: 'c3', movieId, date, time: '16:00', screen: 'IMAX 1', format: 'IMAX' },
    { id: `s11-${movieId}-${date}`, cinemaId: 'c3', movieId, date, time: '20:00', screen: 'IMAX 1', format: 'IMAX' },
  ];
};

// Helper to generate seats
export const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = 14;

  rows.forEach((row, rIndex) => {
    for (let col = 1; col <= cols; col++) {
      let type: 'normal' | 'vip' | 'couple' = 'normal';
      let price = 10;

      if (rIndex >= 4 && rIndex <= 7 && col >= 4 && col <= 11) {
        type = 'vip';
        price = 15;
      } else if (rIndex === 9) {
        type = 'couple';
        price = 25; // price for two
      }

      // Randomly occupy some seats
      const isOccupied = Math.random() < 0.3;

      seats.push({
        id: `${row}${col}`,
        row,
        col,
        type,
        status: isOccupied ? 'occupied' : 'available',
        price,
      });
    }
  });

  return seats;
};

export const mockBookings: Booking[] = [
  {
    id: 'B-12345678',
    movieId: 'm1',
    cinemaId: 'c3',
    showtimeId: 's11-m1-2026-03-28',
    seats: ['G6', 'G7'],
    totalPrice: 30,
    bookingDate: '2026-03-25T10:30:00Z',
    status: 'confirmed'
  },
  {
    id: 'B-87654321',
    movieId: 'm2',
    cinemaId: 'c1',
    showtimeId: 's1-m2-2026-03-20',
    seats: ['E8'],
    totalPrice: 15,
    bookingDate: '2026-03-18T14:20:00Z',
    status: 'watched'
  }
];
