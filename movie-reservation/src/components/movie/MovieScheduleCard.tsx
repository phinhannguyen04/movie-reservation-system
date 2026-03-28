import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { Movie, Cinema, Showtime } from '@/data/mock';
import { cn } from '@/lib/utils';

interface MovieScheduleCardProps {
  movie: Movie;
  cinemaGroups: {
    cinema: Cinema;
    showtimes: Showtime[];
  }[];
  index: number;
  formattedSelectedDate: string;
  isShowtimePast: (time: string) => boolean;
}

export const MovieScheduleCard: React.FC<MovieScheduleCardProps> = ({ 
  movie, 
  cinemaGroups, 
  index, 
  formattedSelectedDate, 
  isShowtimePast 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-surface border border-white/10 rounded-3xl overflow-hidden flex flex-col lg:flex-row group/card border-b-4 border-b-primary/5"
    >
      {/* Movie Info */}
      <div className="lg:w-1/4 shrink-0 bg-white/[0.02] p-8 flex flex-col lg:border-r border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
        
        <Link to={`/movies/${movie.id}`} className="block aspect-[2/3] rounded-2xl overflow-hidden mb-6 relative group shadow-2xl">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-white font-black text-[10px] uppercase tracking-widest border border-white/30 px-4 py-2 rounded-xl">View Production</span>
          </div>
        </Link>
        
        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{movie.title}</h3>
        
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
          <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-primary">{movie.rating}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {movie.duration}m</span>
        </div>
        
        <p className="text-xs text-gray-400 font-medium leading-relaxed opacity-60">{movie.genre.join(', ')}</p>
      </div>

      {/* Cinemas & Showtimes */}
      <div className="p-8 lg:p-10 flex-1 flex flex-col gap-10">
        {cinemaGroups.map((group) => (
          <div key={group.cinema.id} className="last:border-0 relative">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  {group.cinema.name}
                </h4>
                <div className="flex items-center gap-2 ml-10 text-[10px] uppercase tracking-widest font-black text-gray-500 opacity-60">
                   <span>{group.cinema.address}</span>
                   <span>•</span>
                   <span>{group.cinema.distance} Away</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 ml-10">
              {group.showtimes.map((showtime) => {
                const past = isShowtimePast(showtime.time);
                
                if (past) {
                  return (
                    <div
                      key={showtime.id}
                      className="relative rounded-2xl border border-white/5 bg-white/[0.02] opacity-30 cursor-not-allowed p-4 flex flex-col items-center justify-center"
                    >
                      <span className="text-lg font-black text-gray-500">{showtime.time}</span>
                      <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Expired</span>
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={showtime.id}
                    to={`/booking/${movie.id}?date=${formattedSelectedDate}&cinema=${group.cinema.id}&time=${showtime.time}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex flex-col items-center justify-center transition-all hover:border-primary hover:bg-primary/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 active:scale-95"
                  >
                    <span className="text-lg font-black text-white group-hover:text-primary transition-colors">{showtime.time}</span>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1 opacity-60 group-hover:opacity-100">{showtime.format}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        
        {cinemaGroups.length > 0 && (
           <div className="mt-auto pt-6 border-t border-white/5 flex justify-end">
              <Link to={`/movies/${movie.id}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors group/link">
                 Full Screening Details
                 <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
           </div>
        )}
      </div>
    </motion.div>
  );
}
