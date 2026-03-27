import { useState } from 'react';
import { motion } from 'motion/react';
import { Ticket, Calendar, Clock, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { mockBookings, movies, cinemas, Booking, Movie, Cinema } from '@/data/mock';
import { TicketModal } from '@/components/tickets/TicketModal';

export function MyTickets() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedTicket, setSelectedTicket] = useState<{
    booking: Booking;
    movie: Movie;
    cinema: Cinema;
  } | null>(null);

  const upcomingBookings = mockBookings.filter(b => b.status === 'confirmed');
  const pastBookings = mockBookings.filter(b => b.status === 'watched' || b.status === 'cancelled');

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-display font-bold mb-8">My Tickets</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/10">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            "pb-4 px-2 text-sm font-medium transition-colors relative",
            activeTab === 'upcoming' ? "text-primary" : "text-gray-400 hover:text-white"
          )}
        >
          Upcoming
          {activeTab === 'upcoming' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={cn(
            "pb-4 px-2 text-sm font-medium transition-colors relative",
            activeTab === 'past' ? "text-primary" : "text-gray-400 hover:text-white"
          )}
        >
          Past
          {activeTab === 'past' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
      </div>

      {/* Ticket List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayBookings.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            <Ticket className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No tickets found in this category.</p>
          </div>
        ) : (
          displayBookings.map((booking, index) => {
            const movie = movies.find(m => m.id === booking.movieId);
            const cinema = cinemas.find(c => c.id === booking.cinemaId);
            
            if (!movie || !cinema) return null;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-surface rounded-2xl overflow-hidden border border-white/5 flex flex-col"
              >
                <div className="relative h-32">
                  <img src={movie.backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
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
                  <h3 className="text-xl font-bold mb-1">{movie.title}</h3>
                  <p className="text-sm text-gray-400 mb-6 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {cinema.name}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Date
                      </p>
                      <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Time
                      </p>
                      <p className="font-medium">19:30</p> {/* Hardcoded for mock */}
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Seats</p>
                      <p className="font-medium text-primary">{booking.seats.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Booking ID</p>
                      <p className="font-mono">{booking.id}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedTicket({ booking, movie, cinema })}
                      className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                      View Details
                    </button>
                    {booking.status === 'confirmed' && (
                      <div className="w-12 h-12 bg-white rounded-lg p-1">
                        <QRCodeSVG value={booking.id} size={40} />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

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
