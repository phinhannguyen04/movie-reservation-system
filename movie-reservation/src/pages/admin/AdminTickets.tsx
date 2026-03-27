import React, { useState, useMemo } from 'react';
import { Booking } from '@/data/mock';
import { DataTable } from '@/components/admin/ui/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { SearchableSelect } from '@/components/admin/ui/SearchableSelect';

export function AdminTickets() {
  const { user } = useAuth();
  const { tickets: data, deleteTicket, movies, cinemas, showtimes } = useData();

  const [movieFilter, setMovieFilter] = useState('all');
  const [cinemaFilter, setCinemaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = useMemo(() => {
    return data.filter(t => {
      const matchMovie = movieFilter === 'all' || t.movieId === movieFilter;
      const matchCinema = cinemaFilter === 'all' || t.cinemaId === cinemaFilter;
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchMovie && matchCinema && matchStatus;
    });
  }, [data, movieFilter, cinemaFilter, statusFilter]);

  const columns = [
    { header: 'Booking ID', accessor: 'id' as Extract<keyof Booking, string> },
    { 
      header: 'Movie', 
      accessor: 'movieId' as Extract<keyof Booking, string>,
      render: (item: Booking) => <span className="font-bold text-white">{movies.find(m => m.id === item.movieId)?.title || item.movieId}</span>
    },
    { 
      header: 'Cinema', 
      accessor: 'cinemaId' as Extract<keyof Booking, string>,
      render: (item: Booking) => <span className="text-gray-300">{cinemas.find(c => c.id === item.cinemaId)?.name || item.cinemaId}</span>
    },
    { 
      header: 'Time', 
      accessor: 'showtimeId' as Extract<keyof Booking, string>,
      render: (item: Booking) => <span className="text-gray-300">{showtimes.find(s => s.id === item.showtimeId)?.time || item.showtimeId}</span>
    },
    { 
      header: 'Seats', 
      accessor: 'seats' as Extract<keyof Booking, string>,
      render: (item: Booking) => item.seats.join(', ')
    },
    { 
      header: 'Total', 
      accessor: 'totalPrice' as Extract<keyof Booking, string>,
      render: (item: Booking) => <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
    },
    { 
      header: 'Booked', 
      accessor: 'bookingDate' as Extract<keyof Booking, string>,
      render: (item: Booking) => new Date(item.bookingDate).toLocaleDateString()
    },
    { 
      header: 'Status', 
      accessor: 'status' as Extract<keyof Booking, string>,
      render: (item: Booking) => {
        let sc = "bg-gray-500/10 text-gray-400 border-gray-500/20";
        if (item.status === 'confirmed') sc = "bg-green-500/10 text-green-400 border-green-500/20";
        else if (item.status === 'cancelled') sc = "bg-red-500/10 text-red-400 border-red-500/20";
        else if (item.status === 'watched') sc = "bg-blue-500/10 text-blue-400 border-blue-500/20";
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${sc} uppercase tracking-wider`}>
            {item.status}
          </span>
        );
      }
    }
  ];

  const customFilters = (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchableSelect
        options={movies.map(m => ({ value: m.id, label: m.title }))}
        value={movieFilter}
        onChange={setMovieFilter}
        allLabel="All Movies"
        placeholder="Search movie..."
      />
      <SearchableSelect
        options={cinemas.map(c => ({ value: c.id, label: c.name }))}
        value={cinemaFilter}
        onChange={setCinemaFilter}
        allLabel="All Cinemas"
        placeholder="Search cinema..."
      />
      <SearchableSelect
        options={[
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'watched', label: 'Watched' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
        value={statusFilter}
        onChange={setStatusFilter}
        allLabel="All Statuses"
        placeholder="Search status..."
      />
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] relative">
      <DataTable 
        title="Ticket Bookings" 
        description="Track all customer bookings, modify statuses, or cancel tickets." 
        data={filteredData} 
        columns={columns} 
        onDelete={user?.role === 'admin' || user?.role === 'manager' ? (item) => deleteTicket(item.id) : undefined}
        searchPlaceholder="Search booking ID..."
        customFilters={customFilters}
      />
    </div>
  );
}
