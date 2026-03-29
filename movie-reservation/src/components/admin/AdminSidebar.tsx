import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Film, MonitorPlay, Calendar, 
  Ticket, Users, Shield, Settings, X, LogOut, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserBadge } from '@/components/admin/ui/UserBadge';

export const adminLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Movies', path: '/admin/movies', icon: Film },
  { name: 'Cinemas', path: '/admin/cinemas', icon: MonitorPlay },
  { name: 'Showtimes', path: '/admin/showtimes', icon: Calendar },
  { name: 'Tickets', path: '/admin/tickets', icon: Ticket },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Staff', path: '/admin/staff', icon: Shield },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isMobile, onClose }: AdminSidebarProps) {
  const { user, logout } = useAuth();

  const filteredLinks = adminLinks.filter(link => {
    if (!user?.role) return false;
    // Admins see everything
    if (user.role === 'admin') return true;
    
    // Managers can see most things except staff and settings
    if (user.role === 'manager') {
      return !['staff', 'settings'].includes(link.path.split('/').pop() || '');
    }
    
    // Staff can only see dashboard and tickets
    if (user.role === 'staff') {
      return ['admin', 'tickets'].includes(link.path.split('/').pop() || '');
    }
    
    return false;
  });

  return (
    <aside className={cn(
      "flex flex-col bg-surface border-r border-white/5 h-full transition-all duration-500 ease-in-out shadow-2xl z-50",
      isMobile ? "w-full" : "w-72"
    )}>
      {/* Sidebar Header */}
      <div className="p-8 pb-10">
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
               <Film className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-black text-white tracking-widest leading-none">CINEMAX</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mt-1">Admin Panel</span>
            </div>
          </Link>
          {isMobile && (
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Workspace Status */}
        <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 relative overflow-hidden group/user">
          <UserBadge 
            name={user?.name || 'Admin'} 
            avatar={user?.avatar} 
            role={user?.role === 'admin' ? 'System Admin' : 'System User'}
            size="md"
          />
          <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/user:opacity-100 transition-opacity">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all relative group",
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20 translate-x-1" 
                  : "text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{link.name}</span>
              {/* Active Indicator Strip */}
              <div className={cn(
                "absolute left-0 w-1.5 h-1/2 bg-white rounded-full transition-all",
                "hidden group-hover:block",
                "group-[.active]:block group-[.active]:h-8"
              )} />
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 mt-auto">
        <Link 
          to="/" 
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Site
        </Link>
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Terminate session
        </button>
      </div>
    </aside>
  );
}
