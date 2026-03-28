import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Star, Clock, Calendar, Ticket } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { TrailerModal } from '@/components/ui/TrailerModal';

export function MovieDetails() {
  const { id } = useParams();
  const { movies } = useData();
  const movie = movies.find(m => m.id === id);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  if (!movie) {
    return <div className="p-12 text-center">Movie not found</div>;
  }

  return (
    <div className="w-full">
      {/* Hero Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh] w-full">
        <div className="absolute inset-0">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-48 md:w-72 shrink-0 mx-auto md:mx-0"
          >
            <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 pt-4 md:pt-12"
          >
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium mb-4">
              <span className="px-2 py-1 bg-surface-light rounded-md border border-white/10">
                {movie.rating}
              </span>
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                {movie.rating}
              </span>
              <span className="flex items-center gap-1 text-gray-300">
                <Clock className="w-4 h-4" />
                {movie.duration} min
              </span>
              <span className="flex items-center gap-1 text-gray-300">
                <Calendar className="w-4 h-4" />
                {new Date(movie.releaseDate).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
              {movie.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genre.map(g => (
                <span key={g} className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300 border border-white/10">
                  {g}
                </span>
              ))}
            </div>

            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-3xl">
              {movie.synopsis}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Director</h3>
                <p className="font-medium">{movie.director}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Cast</h3>
                <p className="font-medium">{movie.cast.join(', ')}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {new Date(movie.releaseDate) <= new Date('2026-03-27') && (
                <Link
                  to={`/booking/${movie.id}`}
                  className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.4)]"
                >
                  <Ticket className="w-5 h-5" />
                  Book Ticket
                </Link>
              )}
              <button 
                onClick={() => setIsTrailerOpen(true)}
                className="px-8 py-4 bg-surface hover:bg-surface-light text-white font-semibold rounded-lg transition-colors flex items-center gap-2 border border-white/10"
              >
                <Play className="w-5 h-5" />
                Watch Trailer
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        trailerUrl={movie.trailerUrl} 
      />
    </div>
  );
}
