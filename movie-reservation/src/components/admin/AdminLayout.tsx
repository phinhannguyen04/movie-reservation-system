import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Film, MonitorPlay, Calendar, 
  Ticket, Users, Shield, Settings, LogOut, Menu, X, Eye 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Movies', path: '/admin/movies', icon: Film },
  { name: 'Cinemas & Rooms', path: '/admin/cinemas', icon: MonitorPlay },
  { name: 'Showtimes', path: '/admin/showtimes', icon: Calendar },
  { name: 'Tickets', path: '/admin/tickets', icon: Ticket },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Staff & Roles', path: '/admin/staff', icon: Shield },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredLinks = sidebarLinks.filter(link => {
    if (link.path === '/admin') return user?.permissions?.includes('dashboard');
    const requiredPermission = link.path.split('/').pop() || '';
    return user?.permissions?.includes(requiredPermission);
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DataProvider>
      <div className="min-h-screen bg-background text-white flex">
        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            <span className="text-lg font-display font-bold text-white tracking-wider">
              CINEMAX Admin
            </span>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.end}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-black/20">
            <img src={user?.avatar || 'https://i.pravatar.cc/150'} alt="Admin" className="w-8 h-8 rounded-full border border-white/20" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role || 'Administrator'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <header className="h-16 bg-surface/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold lg:hidden">Menu</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-white/10"
              title="View site as end user"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View as User</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-400">System Online</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        </div>
      </div>
    </DataProvider>
  );
}
