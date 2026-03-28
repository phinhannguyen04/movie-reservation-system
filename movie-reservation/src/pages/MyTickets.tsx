import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Ticket, Calendar, Clock, MapPin, Loader2, RefreshCw, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { TicketModal } from '@/components/tickets/TicketModal';
import { movies, cinemas, type Booking, type Movie, type Cinema } from '@/data/mock';

export function MyTickets() {
  const { tickets, loading, refreshTickets } = useData();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedTicket, setSelectedTicket] = useState<{
    booking: Booking;
    movie: Movie;
    cinema: Cinema;
  } | null>(null);

  useEffect(() => {
    refreshTickets();
  }, []);

  // Reset pagination when generic filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, dateFilter]);

  const now = new Date();

  const isTicketPast = (b: Booking): boolean => {
    if (b.status === 'watched' || b.status === 'cancelled') return true;
    try {
      const bDate = new Date(b.bookingDate);
      if (b.showtime) {
        const [hours, minutes] = b.showtime.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          bDate.setHours(hours, minutes, 0, 0);
        }
      }
      return bDate < now;
    } catch {
      return false;
    }
  };

  const getDisplayStatus = (b: Booking) => {
    if (isTicketPast(b)) {
      if (b.status === 'confirmed') return 'watched';
      if (b.status === 'pending') return 'expired';
    }
    return b.status;
  };

  // Filter based on user, status, search, date
  const baseBookings = useMemo(() => {
    // 1. Filter by logged-in user
    let filtered = tickets.filter(b => b.userId === user?.id);

    // 2. Filter by Tab Status
    filtered = filtered.filter(b => {
      const past = isTicketPast(b);
      if (activeTab === 'past') return past;
      if (past) return false;
      
      if (activeTab === 'pending') return b.status === 'pending';
      if (activeTab === 'upcoming') return b.status === 'confirmed';
      return false;
    });

    // 3. Filter by Date
    if (dateFilter !== 'all') {
      const days = dateFilter === '7days' ? 7 : 30;
      const cutoffFromNow = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(b => new Date(b.bookingDate) >= cutoffFromNow);
    }

    // 4. Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => {
        const movieTitle = b.movieTitle || movies.find(m => m.id === b.movieId)?.title || '';
        const cinemaName = b.cinemaName || cinemas.find(c => c.id === b.cinemaId)?.name || '';
        return movieTitle.toLowerCase().includes(query) || 
               cinemaName.toLowerCase().includes(query) || 
               b.id.toLowerCase().includes(query);
      });
    }

    // Sort by most recent booking first
    return filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  }, [tickets, user?.id, activeTab, dateFilter, searchQuery]);

  // Derived arrays
  const totalPages = Math.ceil(baseBookings.length / itemsPerPage);
  const displayBookings = baseBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const userTickets = tickets.filter(b => b.userId === user?.id);
  const pastCount = userTickets.filter(b => isTicketPast(b)).length;
  const pendingCount = userTickets.filter(b => !isTicketPast(b) && b.status === 'pending').length;
  const upcomingCount = userTickets.filter(b => !isTicketPast(b) && b.status === 'confirmed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return "bg-green-500/20 text-green-500";
      case 'pending': return "bg-yellow-500/20 text-yellow-500";
      case 'watched': return "bg-gray-500/20 text-gray-400";
      case 'cancelled': return "bg-red-500/20 text-red-500";
      case 'expired': return "bg-gray-500/20 text-gray-500";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-display font-bold">My Tickets</h1>
        <button
          onClick={() => refreshTickets()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn("pb-4 px-2 text-sm font-medium transition-colors relative", activeTab === 'pending' ? "text-primary" : "text-gray-400 hover:text-white")}
        >
          Pending ({pendingCount})
          {activeTab === 'pending' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn("pb-4 px-2 text-sm font-medium transition-colors relative", activeTab === 'upcoming' ? "text-primary" : "text-gray-400 hover:text-white")}
        >
          Upcoming ({upcomingCount})
          {activeTab === 'upcoming' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={cn("pb-4 px-2 text-sm font-medium transition-colors relative", activeTab === 'past' ? "text-primary" : "text-gray-400 hover:text-white")}
        >
          Past ({pastCount})
          {activeTab === 'past' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by movie, cinema, or booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all" className="bg-surface">All Time</option>
            <option value="7days" className="bg-surface">Last 7 Days</option>
            <option value="30days" className="bg-surface">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Ticket List */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayBookings.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-500">
                <Ticket className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-1">No tickets found</p>
                <p className="text-sm">
                  {searchQuery || dateFilter !== 'all'
                    ? "Try adjusting your search or filters."
                    : activeTab === 'upcoming' || activeTab === 'pending'
                      ? "You don't have any bookings in this status. Go book a movie!"
                      : "You don't have any past bookings yet."}
                </p>
              </div>
            ) : (
              displayBookings.map((booking, index) => {
                const movie = movies.find(m => m.id === booking.movieId);
                const cinema = cinemas.find(c => c.id === booking.cinemaId);

                // Fallback display if movie/cinema not in mock
                const movieTitle = movie?.title || booking.movieTitle || 'Unknown Movie';
                const cinemaName = cinema?.name || booking.cinemaName || 'Unknown Cinema';
                const backdropUrl = movie?.backdropUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800';

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.07 }}
                    className="bg-surface rounded-2xl overflow-hidden border border-white/5 flex flex-col hover:border-white/10 transition-colors"
                  >
                    <div className="relative h-32">
                      <img src={backdropUrl} alt={movieTitle} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                      <div className="absolute top-4 right-4 animate-in fade-in">
                        <span className={cn(
                          "px-2 py-1 text-xs font-bold rounded",
                          getStatusColor(getDisplayStatus(booking))
                        )}>
                          {getDisplayStatus(booking).toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Overlay action for the entire card */}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100"
                           onClick={() => setSelectedTicket({ 
                             booking, 
                             movie: movie || { id: booking.movieId, title: movieTitle, backdropUrl } as Movie, 
                             cinema: cinema || { id: booking.cinemaId, name: cinemaName } as Cinema 
                           })}>
                         <div className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg transform scale-95 hover:scale-105 transition-transform">
                           View Ticket Details
                         </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-1 truncate" title={movieTitle}>{movieTitle}</h3>
                      <p className="text-sm text-gray-400 mb-6 flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{cinemaName}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" />Date</p>
                          <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />Time</p>
                          <p className="font-medium">{booking.showtime || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Seats</p>
                          <p className="font-medium text-primary line-clamp-1" title={booking.seats?.join(', ')}>{booking.seats?.join(', ') || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Total</p>
                          <p className="font-medium text-white">${booking.totalPrice?.toFixed(2) || '—'}</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                        <button
                          onClick={() => setSelectedTicket({ 
                            booking, 
                            movie: movie || { id: booking.movieId, title: movieTitle, backdropUrl } as Movie, 
                            cinema: cinema || { id: booking.cinemaId, name: cinemaName } as Cinema 
                          })}
                          className="text-sm text-primary hover:text-primary-hover font-medium transition-colors flex items-center gap-1"
                        >
                          View Details
                        </button>
                        
                        <p className="font-mono text-xs text-gray-600 ml-auto mr-4" title={booking.id}>{String(booking.id).substring(0, 8)}...</p>
                        
                        {(booking.status === 'confirmed' || booking.status === 'pending') && (
                          <div className="w-10 h-10 bg-white rounded-lg p-1 flex-shrink-0 ml-2">
                            <QRCodeSVG value={String(booking.id)} size={32} />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-surface border border-white/5 hover:bg-white/5 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                      currentPage === i + 1 
                        ? "bg-primary text-white" 
                        : "bg-surface border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-surface border border-white/5 hover:bg-white/5 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      <TicketModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        booking={selectedTicket?.booking || null}
        movie={selectedTicket?.movie || null}
        cinema={selectedTicket?.cinema || null}
      />
    </div>
  );
}
