import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Star, Clock, Ticket, Calendar } from 'lucide-react';
import { movies } from '@/data/mock';
import { TrailerModal } from '@/components/ui/TrailerModal';

export function Home() {
  const currentDate = new Date('2026-03-27');
  
  // Filter movies
  const nowPlayingMovies = movies.filter(m => new Date(m.releaseDate) <= currentDate);
  const comingSoonMovies = movies.filter(m => new Date(m.releaseDate) > currentDate);

  const featuredMovie = nowPlayingMovies[0];
  const nowPlaying = nowPlayingMovies.slice(1, 5);
  const comingSoon = comingSoonMovies.slice(0, 4);

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={featuredMovie.backdropUrl}
            alt={featuredMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-primary">
              <span className="px-2 py-1 bg-primary/20 rounded-md border border-primary/30">
                NOW SHOWING
              </span>
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                {featuredMovie.rating}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight">
              {featuredMovie.title}
            </h1>

            <p className="text-lg text-gray-300 line-clamp-3 md:line-clamp-none">
              {featuredMovie.synopsis}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {featuredMovie.duration} min
              </span>
              <span>•</span>
              <span>{featuredMovie.genre.join(', ')}</span>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                to={`/booking/${featuredMovie.id}`}
                className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.4)]"
              >
                <Ticket className="w-5 h-5" />
                Book Ticket
              </Link>
              <button 
                onClick={() => setIsTrailerOpen(true)}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
              >
                <Play className="w-5 h-5" />
                Watch Trailer
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Now Playing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold">Now Playing</h2>
          <Link to="/movies" className="text-primary hover:text-primary-hover font-medium flex items-center gap-1">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {nowPlaying.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative rounded-xl overflow-hidden bg-surface"
            >
              <div className="block aspect-[2/3] overflow-hidden">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <Link to={`/movies/${movie.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {movie.title}</span>
                  </Link>
                  <h3 className="text-lg font-bold text-white mb-1 relative z-20">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-300 mb-3 relative z-20">
                    <span className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3 h-3 fill-current" />
                      {movie.rating}
                    </span>
                    <span>•</span>
                    <span>{movie.duration}m</span>
                  </div>
                  <div className="flex flex-col gap-2 relative z-20">
                    <Link
                      to={`/movies/${movie.id}`}
                      className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-center text-sm font-semibold rounded-md transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/booking/${movie.id}`}
                      className="w-full py-2 bg-primary text-white text-center text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Coming Soon
            </h2>
            <Link to="/movies?tab=coming-soon" className="text-primary hover:text-primary-hover font-medium flex items-center gap-1">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {comingSoon.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative rounded-xl overflow-hidden bg-surface"
              >
                <div className="block aspect-[2/3] overflow-hidden">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <Link to={`/movies/${movie.id}`} className="absolute inset-0 z-10">
                      <span className="sr-only">View {movie.title}</span>
                    </Link>
                    <h3 className="text-lg font-bold text-white mb-1 relative z-20">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-300 mb-3 relative z-20">
                      <span className="flex items-center gap-1 text-primary">
                        <Calendar className="w-3 h-3" />
                        {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span>{movie.genre[0]}</span>
                    </div>
                    <div className="flex flex-col gap-2 relative z-20">
                      <Link
                        to={`/movies/${movie.id}`}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-center text-sm font-semibold rounded-md transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        trailerUrl={featuredMovie.trailerUrl} 
      />
    </div>
  );
}
