import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Ticket, Calendar, Clock, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { TicketModal } from '@/components/tickets/TicketModal';
import { movies, cinemas, type Booking, type Movie, type Cinema } from '@/data/mock';

export function MyTickets() {
  const { tickets, loading, refreshTickets } = useData();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedTicket, setSelectedTicket] = useState<{
    booking: Booking;
    movie: Movie;
    cinema: Cinema;
  } | null>(null);

  useEffect(() => {
    refreshTickets();
  }, []);

  const now = new Date();

  const upcomingBookings = tickets.filter(b => b.status === 'confirmed');
  const pastBookings = tickets.filter(b => b.status === 'watched' || b.status === 'cancelled');
  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

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
      <div className="flex gap-4 mb-8 border-b border-white/10">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn("pb-4 px-2 text-sm font-medium transition-colors relative", activeTab === 'upcoming' ? "text-primary" : "text-gray-400 hover:text-white")}
        >
          Upcoming ({upcomingBookings.length})
          {activeTab === 'upcoming' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={cn("pb-4 px-2 text-sm font-medium transition-colors relative", activeTab === 'past' ? "text-primary" : "text-gray-400 hover:text-white")}
        >
          Past ({pastBookings.length})
          {activeTab === 'past' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Ticket List */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBookings.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-500">
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium mb-1">No {activeTab} tickets</p>
              <p className="text-sm">
                {activeTab === 'upcoming'
                  ? "You don't have any upcoming bookings. Go book a movie!"
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
                  className="bg-surface rounded-2xl overflow-hidden border border-white/5 flex flex-col"
                >
                  <div className="relative h-32">
                    <img src={backdropUrl} alt={movieTitle} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className={cn(
                        "px-2 py-1 text-xs font-bold rounded",
                        booking.status === 'confirmed' ? "bg-green-500/20 text-green-500" :
                        booking.status === 'watched' ? "bg-gray-500/20 text-gray-400" :
                        "bg-red-500/20 text-red-500"
                      )}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-1">{movieTitle}</h3>
                    <p className="text-sm text-gray-400 mb-6 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{cinemaName}
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
                        <p className="font-medium text-primary">{booking.seats?.join(', ') || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Total</p>
                        <p className="font-medium text-white">${booking.totalPrice?.toFixed(2) || '—'}</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                      {movie && cinema && (
                        <button
                          onClick={() => setSelectedTicket({ booking, movie, cinema })}
                          className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                        >
                          View Details
                        </button>
                      )}
                      <p className="font-mono text-xs text-gray-600">{String(booking.id).substring(0, 12)}...</p>
                      {booking.status === 'confirmed' && (
                        <div className="w-12 h-12 bg-white rounded-lg p-1">
                          <QRCodeSVG value={String(booking.id)} size={40} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
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
