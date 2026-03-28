import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { TrailerModal } from '@/components/ui/TrailerModal';
import { MovieHero } from '@/components/movie/MovieHero';
import { SectionHeader } from '@/components/movie/SectionHeader';
import { MovieCard } from '@/components/movie/MovieCard';
import { Calendar } from 'lucide-react';

export function Home() {
  const { movies, loading } = useData();
  const currentDate = new Date();
  
  // Filter movies
  const nowPlayingMovies = movies.filter(m => new Date(m.releaseDate) <= currentDate);
  const comingSoonMovies = movies.filter(m => new Date(m.releaseDate) > currentDate);

  const featuredMovie = nowPlayingMovies[0];
  const nowPlaying = nowPlayingMovies.slice(1, 5);
  const comingSoon = comingSoonMovies.slice(0, 4);

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">No movies found</h2>
        <p className="text-gray-400">Please check back later or add movies in the Admin Panel.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {featuredMovie && (
        <>
          <MovieHero 
            movie={featuredMovie} 
            onWatchTrailer={() => setIsTrailerOpen(true)} 
          />
          <TrailerModal 
            isOpen={isTrailerOpen} 
            onClose={() => setIsTrailerOpen(false)} 
            trailerUrl={featuredMovie.trailerUrl} 
          />
        </>
      )}

      {/* Now Playing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeader 
          title="Current Productions" 
          viewAllLink="/movies" 
        />

        {nowPlaying.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {nowPlaying.map((movie, index) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                index={index} 
                variant="playing" 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-gray-500">No movies currently playing.</p>
          </div>
        )}
      </section>

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <SectionHeader 
            title="Anticipated Releases" 
            icon={Calendar}
            viewAllLink="/movies?tab=coming-soon" 
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {comingSoon.map((movie, index) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                index={index} 
                variant="soon" 
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
