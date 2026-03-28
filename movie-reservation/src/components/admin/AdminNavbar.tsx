import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Film, MonitorPlay, Calendar, 
  Ticket, Users, Shield, Settings, LogOut, Eye, Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

const adminLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Movies', path: '/admin/movies', icon: Film },
  { name: 'Cinemas', path: '/admin/cinemas', icon: MonitorPlay },
  { name: 'Showtimes', path: '/admin/showtimes', icon: Calendar },
  { name: 'Tickets', path: '/admin/tickets', icon: Ticket },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Staff', path: '/admin/staff', icon: Shield },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export function AdminNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredLinks = adminLinks.filter(link => {
    if (!user?.permissions) return false;
    if (link.path === '/admin') return user.permissions.includes('dashboard');
    const requiredPermission = link.path.split('/').pop() || '';
    return user.permissions.includes(requiredPermission);
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center shrink-0 gap-4">
            <button 
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              <Film className="w-8 h-8 text-primary" />
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold text-white tracking-wider leading-none">
                  CINEMAX
                </span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mt-1">
                  Admin Panel
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {filteredLinks.slice(0, 5).map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center shrink-0 gap-2 sm:gap-4">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
            >
              <Eye className="w-4 h-4" />
              Exit Admin
            </Link>
            
            <div className="flex items-center gap-2 sm:ml-4 sm:pl-4 sm:border-l border-white/10">
              <div className="hidden sm:flex flex-col text-right mr-3">
                <span className="text-sm font-black text-white tracking-tight leading-none mb-1">{user?.name}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Administrator</span>
              </div>
              <UserAvatar 
                name={user?.name || 'Admin'} 
                avatar={user?.avatar} 
                className="w-10 h-10 rounded-xl border border-white/10 shrink-0 object-cover shadow-lg shadow-black/20" 
              />
              <button 
                onClick={logout} 
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
