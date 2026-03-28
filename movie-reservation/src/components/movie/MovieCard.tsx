import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Calendar, Clock } from 'lucide-react';
import { Movie } from '@/data/mock';
import { cn } from '@/lib/utils';

interface MovieCardProps extends React.Attributes {
  movie: Movie;
  index: number;
  variant?: 'playing' | 'soon';
  className?: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, index, variant = 'playing', className }) => {
  const isSoon = variant === 'soon';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn("group relative rounded-2xl overflow-hidden bg-surface shadow-lg hover:shadow-primary/5 transition-all duration-500", className)}
    >
      <div className="block aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
          <Link to={`/movies/${movie.id}`} className="absolute inset-0 z-10">
            <span className="sr-only">View {movie.title}</span>
          </Link>
          
          <div className="relative z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{movie.title}</h3>
            
            <div className="flex items-center gap-3 text-xs text-gray-300 mb-4 font-medium">
              {isSoon ? (
                <span className="flex items-center gap-1.5 text-primary">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-current" />
                    {movie.rating}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {movie.duration}m
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Link
                to={`/movies/${movie.id}`}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-center text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-white/5 active:scale-95"
              >
                View Details
              </Link>
              {!isSoon && (
                <Link
                  to={`/booking/${movie.id}`}
                  className="w-full py-2.5 bg-primary text-white text-center text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                  Book Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
