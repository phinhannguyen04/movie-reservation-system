import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Clock, ArrowUpDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { movies } from '@/data/mock';

const MOVIES_PER_PAGE = 8;

export function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'now-playing';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync tab state with URL
  useEffect(() => {
    setSearchParams({ tab: activeTab });
    setCurrentPage(1);
  }, [activeTab, setSearchParams]);

  // Reset to page 1 when sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  const currentDate = new Date('2026-03-27');

  const filteredMovies = movies.filter(movie => {
    const releaseDate = new Date(movie.releaseDate);
    if (activeTab === 'now-playing') {
      return releaseDate <= currentDate;
    } else {
      return releaseDate > currentDate;
    }
  });

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedMovies.length / MOVIES_PER_PAGE);
  const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
  const currentMovies = sortedMovies.slice(startIndex, startIndex + MOVIES_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-4xl font-display font-bold">Movies</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Tabs */}
          <div className="flex p-1 bg-surface border border-white/10 rounded-lg">
            <button
              onClick={() => setActiveTab('now-playing')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'now-playing'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Now Playing
            </button>
            <button
              onClick={() => setActiveTab('coming-soon')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'coming-soon'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Coming Soon
            </button>
          </div>

          <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-lg px-3 py-2 w-fit">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-surface">Newest First</option>
              <option value="oldest" className="bg-surface">Oldest First</option>
              <option value="title" className="bg-surface">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentMovies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                  {activeTab === 'now-playing' ? (
                    <>
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        {movie.rating}
                      </span>
                      <span>•</span>
                      <span>{movie.duration}m</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1 text-primary">
                        <Calendar className="w-3 h-3" />
                        {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span>{movie.genre[0]}</span>
                    </>
                  )}
                </div>
                <div className="flex flex-col gap-2 relative z-20">
                  <Link
                    to={`/movies/${movie.id}`}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-center text-sm font-semibold rounded-md transition-colors"
                  >
                    View Details
                  </Link>
                  {activeTab === 'now-playing' && (
                    <Link
                      to={`/booking/${movie.id}`}
                      className="w-full py-2 bg-primary text-white text-center text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors"
                    >
                      Book Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-white/10 bg-surface hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-lg border transition-colors ${
                currentPage === i + 1 
                  ? 'bg-primary border-primary text-white font-bold' 
                  : 'border-white/10 bg-surface hover:bg-white/5 text-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-white/10 bg-surface hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
