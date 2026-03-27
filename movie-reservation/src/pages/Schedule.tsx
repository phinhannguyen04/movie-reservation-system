import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { movies, cinemas, generateShowtimes } from '@/data/mock';
import { cn } from '@/lib/utils';

export function Schedule() {
  // Generate next 7 days
  const dates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);

  const formattedSelectedDate = selectedDate.toISOString().split('T')[0];

  // Group showtimes by movie, then by cinema
  const scheduleData = useMemo(() => {
    const data: any[] = [];
    
    movies.forEach(movie => {
      // Skip movies that haven't been released yet
      if (new Date(movie.releaseDate) > new Date('2026-03-27')) {
        return;
      }

      const showtimes = generateShowtimes(movie.id, formattedSelectedDate);
      if (showtimes.length > 0) {
        const cinemaGroups = cinemas.map(cinema => {
          const cinemaShowtimes = showtimes.filter(s => s.cinemaId === cinema.id);
          return {
            cinema,
            showtimes: cinemaShowtimes
          };
        }).filter(group => group.showtimes.length > 0);

        if (cinemaGroups.length > 0) {
          data.push({
            movie,
            cinemaGroups
          });
        }
      }
    });
    
    return data;
  }, [formattedSelectedDate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <CalendarIcon className="w-8 h-8 text-primary" />
        <h1 className="text-4xl font-display font-bold">Showtimes & Tickets</h1>
      </div>

      {/* Date Selector */}
      <div className="flex overflow-x-auto pb-4 mb-8 gap-3 scrollbar-hide">
        {dates.map((date, index) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNumber = date.getDate();
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });

          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl border transition-all shrink-0",
                isSelected 
                  ? "bg-primary border-primary text-white" 
                  : "bg-surface border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="text-xs font-medium uppercase tracking-wider mb-1">{dayName}</span>
              <span className="text-2xl font-bold">{dayNumber}</span>
              <span className="text-xs">{monthName}</span>
            </button>
          );
        })}
      </div>

      {/* Movie Schedule List */}
      <div className="space-y-8">
        {scheduleData.map(({ movie, cinemaGroups }, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-surface border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Movie Info */}
            <div className="md:w-1/4 shrink-0 bg-black/20 p-6 flex flex-col md:border-r border-white/10">
              <Link to={`/movies/${movie.id}`} className="block aspect-[2/3] rounded-lg overflow-hidden mb-4 relative group">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium text-sm border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-sm">View Details</span>
                </div>
              </Link>
              <h3 className="text-xl font-bold text-white mb-2">{movie.title}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-400 mb-3">
                <span className="border border-white/20 px-2 py-0.5 rounded text-xs">{movie.rating}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {movie.duration}m</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{movie.genre.join(', ')}</p>
            </div>

            {/* Cinemas & Showtimes */}
            <div className="p-6 flex-1 flex flex-col gap-6">
              {cinemaGroups.map((group: any) => (
                <div key={group.cinema.id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {group.cinema.name}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1 ml-6">{group.cinema.address} • {group.cinema.distance}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 ml-6">
                    {group.showtimes.map((showtime: any) => (
                      <Link
                        key={showtime.id}
                        to={`/booking/${movie.id}?date=${formattedSelectedDate}&cinema=${group.cinema.id}&time=${showtime.time}`}
                        className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 hover:border-primary hover:bg-primary/10 transition-all p-3 flex flex-col items-center min-w-[90px]"
                      >
                        <span className="text-lg font-bold text-white group-hover:text-primary transition-colors">{showtime.time}</span>
                        <span className="text-xs text-gray-400 mt-1">{showtime.format}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
