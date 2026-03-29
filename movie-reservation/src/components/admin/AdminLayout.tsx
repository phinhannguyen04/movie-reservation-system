import { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  Film, ShieldAlert, Menu, Bell, Search, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { motion, AnimatePresence } from 'motion/react';
import { UserBadge } from '@/components/admin/ui/UserBadge';

export function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#0F0F12] text-white flex">
      {/* Persistent Sidebar Desktop */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 h-full"
            >
              <AdminSidebar isMobile onClose={() => setIsMobileOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-surface/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-40 sticky top-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-3 rounded-2xl bg-white/5 text-gray-400 hover:text-white transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-4 px-6 py-2.5 rounded-2xl bg-black/20 border border-white/5 group/search w-[400px]">
               <Search className="w-4 h-4 text-gray-500 group-focus-within/search:text-primary transition-colors" />
               <input type="text" placeholder="Access system nodes..." className="bg-transparent border-none outline-none text-xs font-bold w-full placeholder-gray-700" />
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all relative">
                   <Bell className="w-5 h-5" />
                   <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-4 ring-[#16161A]" />
                </button>
                <Link to="/admin/settings" className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                   <Settings className="w-5 h-5" />
                </Link>
                <button 
                  onClick={useAuth().logout} 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all ml-1"
                  title="Terminate Session"
                >
                   <LogOut className="w-5 h-5" />
                </button>
             </div>
          </div>
        </header>

        {/* Dynamic Route View */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
