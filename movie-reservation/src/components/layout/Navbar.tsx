import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Home, Ticket, User, Search, X, Calendar, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { movies } from '@/data/mock';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const navItems = isAuthenticated ? [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'My Tickets', path: '/tickets', icon: Ticket },
  ] : [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
  ];

  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search when route changes
  useEffect(() => {
    setSearchQuery('');
    setIsSearchFocused(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <Film className="w-8 h-8 text-primary" />
              <span className="text-xl font-display font-bold text-white tracking-wider hidden sm:block">
                CINEMAX
              </span>
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="block w-full pl-10 pr-10 py-2 border border-white/10 rounded-full leading-5 bg-surface/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-surface focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {isSearchFocused && searchQuery.trim() !== '' && (
              <div className="absolute mt-2 w-full bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <ul className="max-h-96 overflow-y-auto py-2">
                    {searchResults.map((movie) => (
                      <li key={movie.id}>
                        <Link
                          to={`/movies/${movie.id}`}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors"
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchFocused(false);
                          }}
                        >
                          <img 
                            src={movie.posterUrl} 
                            alt={movie.title} 
                            className="w-10 h-14 object-cover rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-white line-clamp-1">{movie.title}</p>
                            <p className="text-xs text-gray-400">{movie.releaseDate.substring(0, 4)} • {movie.rating}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">
                    No movies found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center shrink-0">
            <div className="flex items-center space-x-4 lg:space-x-6">
              {navItems.filter(item => item.name !== 'Profile').map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                                (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "text-primary bg-primary/10" 
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
              {isAuthenticated && user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={cn(
                    "ml-4 px-4 py-2 border rounded-xl transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2",
                    location.pathname.startsWith('/admin')
                      ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20"
                      : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                  )}
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 ml-6 pl-6 border-l border-white/10">
                  <div className="flex items-center gap-3 pr-2">
                    <UserAvatar 
                      name={user.name} 
                      avatar={user.avatar} 
                      className="w-10 h-10 rounded-xl border border-white/10 shrink-0 object-cover shadow-lg shadow-black/20" 
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-black text-white tracking-tight leading-none mb-1 whitespace-nowrap">{user.name}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">System User</span>
                    </div>
                  </div>
                  <button 
                    onClick={logout} 
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    title="Terminate Session"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-4">
                  <Link to="/login" className="px-4 py-2 hover:bg-white/5 text-white rounded-lg font-medium transition-colors text-sm">Sign In</Link>
                  <Link to="/register" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors text-sm">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                            (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive ? "text-primary" : "text-gray-400 hover:text-gray-200"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
