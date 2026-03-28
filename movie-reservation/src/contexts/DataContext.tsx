import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Movie, Cinema, Showtime, Booking } from '@/data/mock';
import { api } from '@/services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'active' | 'inactive' | 'locked';
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

interface DataContextType {
  movies: Movie[];
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
  addMovie: (movie: Omit<Movie, 'id'>) => Promise<void>;
  updateMovie: (movie: Movie) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;
  refreshMovies: () => Promise<void>;

  cinemas: Cinema[];
  setCinemas: React.Dispatch<React.SetStateAction<Cinema[]>>;
  addCinema: (cinema: Omit<Cinema, 'id' | 'rooms'>) => Promise<void>;
  updateCinema: (cinema: Cinema) => Promise<void>;
  deleteCinema: (id: string) => Promise<void>;
  refreshCinemas: () => Promise<void>;

  showtimes: Showtime[];
  setShowtimes: React.Dispatch<React.SetStateAction<Showtime[]>>;
  addShowtime: (showtime: Omit<Showtime, 'id'>) => Promise<void>;
  updateShowtime: (showtime: Showtime) => Promise<void>;
  deleteShowtime: (id: string) => Promise<void>;
  refreshShowtimes: () => Promise<void>;

  tickets: Booking[];
  setTickets: React.Dispatch<React.SetStateAction<Booking[]>>;
  addTicket: (ticket: Omit<Booking, 'id'>) => Promise<void>;
  updateTicket: (ticket: Booking) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  refreshTickets: () => Promise<void>;

  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  addStaff: (staffMember: { name: string; email: string; password: string; role: string }) => Promise<void>;
  updateStaff: (staffMember: Staff) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  refreshStaff: () => Promise<void>;

  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addUser: (user: User) => void;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;

  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all data on mount ────────────────────────────
  const refreshMovies = useCallback(async () => {
    try { const res: any = await api.get('/movies'); setMovies(res.items || res); } catch (e) { console.error('Failed to load movies', e); }
  }, []);

  const refreshCinemas = useCallback(async () => {
    try { const res: any = await api.get('/cinemas'); setCinemas(res.items || res); } catch (e) { console.error('Failed to load cinemas', e); }
  }, []);

  const refreshShowtimes = useCallback(async () => {
    try { const res: any = await api.get('/showtimes'); setShowtimes(res.items || res); } catch (e) { console.error('Failed to load showtimes', e); }
  }, []);

  const refreshTickets = useCallback(async () => {
    try { const res: any = await api.get('/bookings'); setTickets(res.items || res); } catch (e) { console.error('Failed to load bookings', e); }
  }, []);

  const refreshStaff = useCallback(async () => {
    try { const res: any = await api.get('/staff'); setStaff(res.items || res); } catch (e) { console.error('Failed to load staff', e); }
  }, []);

  const refreshUsers = useCallback(async () => {
    try { const res: any = await api.get('/users'); setUsers(res.items || res); } catch (e) { console.error('Failed to load users', e); }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        refreshMovies(), refreshCinemas(), refreshShowtimes(),
        refreshTickets(), refreshStaff(), refreshUsers()
      ]);
      setLoading(false);
    };
    loadAll();
  }, [refreshMovies, refreshCinemas, refreshShowtimes, refreshTickets, refreshStaff, refreshUsers]);

  // ── CRUD: Movies ───────────────────────────────────────
  const addMovie = async (movie: Omit<Movie, 'id'>) => {
    await api.post('/movies', movie);
    await refreshMovies();
  };
  const updateMovie = async (movie: Movie) => {
    await api.put(`/movies/${movie.id}`, movie);
    await refreshMovies();
  };
  const deleteMovie = async (id: string) => {
    await api.del(`/movies/${id}`);
    await refreshMovies();
  };

  // ── CRUD: Cinemas ──────────────────────────────────────
  const addCinema = async (cinema: Omit<Cinema, 'id' | 'rooms'>) => {
    await api.post('/cinemas', cinema);
    await refreshCinemas();
  };
  const updateCinema = async (cinema: Cinema) => {
    await api.put(`/cinemas/${cinema.id}`, cinema);
    await refreshCinemas();
  };
  const deleteCinema = async (id: string) => {
    await api.del(`/cinemas/${id}`);
    await refreshCinemas();
  };

  // ── CRUD: Showtimes ────────────────────────────────────
  const addShowtime = async (showtime: Omit<Showtime, 'id'>) => {
    await api.post('/showtimes', showtime);
    await refreshShowtimes();
  };
  const updateShowtime = async (showtime: Showtime) => {
    await api.put(`/showtimes/${showtime.id}`, showtime);
    await refreshShowtimes();
  };
  const deleteShowtime = async (id: string) => {
    await api.del(`/showtimes/${id}`);
    await refreshShowtimes();
  };

  // ── CRUD: Tickets (Bookings) ───────────────────────────
  const addTicket = async (ticket: Omit<Booking, 'id'>) => {
    await api.post('/bookings', ticket);
    await refreshTickets();
  };
  const updateTicket = async (ticket: Booking) => {
    await api.put(`/bookings/${ticket.id}`, { status: ticket.status });
    await refreshTickets();
  };
  const deleteTicket = async (id: string) => {
    await api.del(`/bookings/${id}`);
    await refreshTickets();
  };

  // ── CRUD: Staff ────────────────────────────────────────
  const addStaff = async (staffMember: { name: string; email: string; password: string; role: string }) => {
    await api.post('/staff', staffMember);
    await refreshStaff();
  };
  const updateStaff = async (staffMember: Staff) => {
    await api.put(`/staff/${staffMember.id}`, staffMember);
    await refreshStaff();
  };
  const deleteStaff = async (id: string) => {
    await api.del(`/staff/${id}`);
    await refreshStaff();
  };

  // ── CRUD: Users ────────────────────────────────────────
  const addUser = (user: User) => setUsers(prev => [...prev, user]);
  const updateUser = async (user: User) => {
    await api.put(`/users/${user.id}`, user);
    await refreshUsers();
  };
  const deleteUser = async (id: string) => {
    await api.del(`/users/${id}`);
    await refreshUsers();
  };

  return (
    <DataContext.Provider value={{
      movies, setMovies, addMovie, updateMovie, deleteMovie, refreshMovies,
      cinemas, setCinemas, addCinema, updateCinema, deleteCinema, refreshCinemas,
      showtimes, setShowtimes, addShowtime, updateShowtime, deleteShowtime, refreshShowtimes,
      tickets, setTickets, addTicket, updateTicket, deleteTicket, refreshTickets,
      staff, setStaff, addStaff, updateStaff, deleteStaff, refreshStaff,
      users, setUsers, addUser, updateUser, deleteUser, refreshUsers,
      loading
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within DataProvider');
  return context;
}
