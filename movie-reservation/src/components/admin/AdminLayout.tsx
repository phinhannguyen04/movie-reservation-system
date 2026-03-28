import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Film, MonitorPlay, Calendar, 
  Ticket, Users, Shield, Settings, X, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { AdminNavbar } from './AdminNavbar';
import { motion, AnimatePresence } from 'motion/react';

const sidebarLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Movies', path: '/admin/movies', icon: Film },
  { name: 'Cinemas', path: '/admin/cinemas', icon: MonitorPlay },
  { name: 'Showtimes', path: '/admin/showtimes', icon: Calendar },
  { name: 'Tickets', path: '/admin/tickets', icon: Ticket },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Staff', path: '/admin/staff', icon: Shield },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const filteredLinks = sidebarLinks.filter(link => {
    if (!user?.permissions) return false;
    if (link.path === '/admin') return user.permissions.includes('dashboard');
    const requiredPermission = link.path.split('/').pop() || '';
    return user.permissions.includes(requiredPermission);
  });

  if (!user || !['admin', 'manager', 'staff'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-[32px] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-red-500/5">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-display font-black text-white mb-3 uppercase tracking-tighter">Access Denied</h1>
        <p className="text-gray-500 max-w-sm mb-12 font-medium leading-relaxed">Your current identity lacks the cryptographic clearance required for this administrative node.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate('/login')} className="px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/10 hover:scale-105 active:scale-95 transition-all">Authenticate</button>
          <button onClick={() => navigate('/')} className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <AdminNavbar onMenuClick={() => setIsMobileOpen(true)} />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-surface border-r border-white/10 z-[70] lg:hidden p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <Link to="/admin" className="flex items-center gap-2">
                  <Film className="w-8 h-8 text-primary" />
                  <span className="text-2xl font-display font-bold text-white tracking-wider">CINEMAX</span>
                </Link>
                <button onClick={() => setIsMobileOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {filteredLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      end={link.end}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) => cn(
                        "flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all",
                        isActive 
                          ? "bg-primary text-white shadow-xl shadow-primary/20" 
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {link.name}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-white/10 mt-auto">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
                  <img src={user?.avatar || 'https://i.pravatar.cc/150'} alt="Admin" className="w-12 h-12 rounded-xl border border-white/10 object-cover" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-black text-white truncate">{user?.name}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{user?.role}</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <Outlet />
      </main>
    </div>
  );
}
