import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { MovieCard } from '@/components/movie/MovieCard';

const MOVIES_PER_PAGE = 8;

export function Movies() {
  const { movies, loading } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'now-playing';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync tab state with URL
  useEffect(() => {
    setSearchParams({ tab: activeTab });
    setCurrentPage(1);
  }, [activeTab, setSearchParams]);

  // Reset to page 1 when sorting or searching changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, searchQuery]);

  const currentDate = new Date();

  const filteredMovies = movies.filter(movie => {
    const releaseDate = new Date(movie.releaseDate);
    const matchesTab = activeTab === 'now-playing' 
      ? releaseDate <= currentDate 
      : releaseDate > currentDate;
    
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          movie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Movies</h1>
          <p className="text-gray-500 mt-2">Explore our collection of cinematic masterpieces</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Search bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search title, genre..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-full sm:w-64"
            />
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-surface border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveTab('now-playing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'now-playing'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Now Playing
            </button>
            <button
              onClick={() => setActiveTab('coming-soon')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'coming-soon'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Coming Soon
            </button>
          </div>

          <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-4 py-2 w-fit">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="newest" className="bg-surface text-white">Newest First</option>
              <option value="oldest" className="bg-surface text-white">Oldest First</option>
              <option value="title" className="bg-surface text-white">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
      
      {currentMovies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {currentMovies.map((movie, index) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              index={index} 
              variant={activeTab === 'now-playing' ? 'playing' : 'soon'} 
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
          <p className="text-gray-500 text-lg">No movies found matching your criteria.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-16">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-xl border border-white/10 bg-surface hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-11 h-11 rounded-xl border transition-all font-bold ${
                  currentPage === i + 1 
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' 
                    : 'border-white/10 bg-surface hover:bg-white/5 text-gray-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-xl border border-white/10 bg-surface hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
