import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Ticket, Star, Info, CheckCircle2, Trash2, Check, Loader2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { movies } from '@/data/mock';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'ticket' | 'promo' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: typeof Ticket;
  color: string;
  bg: string;
}

const systemNotifications: Notification[] = [
  {
    id: 'promo-1',
    type: 'promo',
    title: 'Weekend Special Offer',
    message: 'Get 20% off on all IMAX screenings this weekend. Use code IMAX20.',
    time: '1 day ago',
    read: true,
    icon: Star,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10'
  },
  {
    id: 'system-1',
    type: 'system',
    title: 'Welcome to Cinemax!',
    message: 'Book your favorite movies and enjoy the best cinema experience.',
    time: '3 days ago',
    read: true,
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
];

export function Notifications() {
  const { tickets, loading } = useData();
  const { user } = useAuth();
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('notification_read_ids') || '[]')); } catch { return new Set(); }
  });
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('notification_deleted_ids') || '[]')); } catch { return new Set(); }
  });

  // Build notifications from real booking data + system notifications
  useEffect(() => {
    const bookingNotifs: Notification[] = tickets
      .filter(b => b.userId === user?.id)
      .slice()
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
      .slice(0, 10) // Only last 10
      .map((booking): Notification => {
        const movie = movies.find(m => m.id === booking.movieId);
        const movieTitle = movie?.title || booking.movieTitle || 'a movie';
        const isRecent = (Date.now() - new Date(booking.bookingDate).getTime()) < 24 * 60 * 60 * 1000;
        
        const timeStr = (() => {
          try {
            return formatDistanceToNow(new Date(booking.bookingDate), { addSuffix: true });
          } catch {
            return new Date(booking.bookingDate).toLocaleDateString();
          }
        })();

        const notifId = `booking-${booking.id}`;

        if (booking.status === 'cancelled') {
          return {
            id: notifId,
            type: 'ticket',
            title: 'Booking Cancelled',
            message: `Your booking for "${movieTitle}" has been cancelled.`,
            time: timeStr,
            read: !isRecent || readIds.has(notifId),
            icon: Ticket,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
          };
        }

        return {
          id: notifId,
          type: 'ticket',
          title: 'Booking Confirmed! 🎬',
          message: `Your ${booking.seats?.length || 1} ticket(s) for "${movieTitle}" at ${booking.cinemaName || 'the cinema'} on ${
            (() => { try { return format(new Date(booking.bookingDate), 'dd MMM yyyy'); } catch { return ''; } })()
          } (${booking.showtime || ''}) — Seats: ${booking.seats?.join(', ') || '—'}.`,
          time: timeStr,
          read: !isRecent || readIds.has(notifId),
          icon: CheckCircle2,
          color: 'text-green-500',
          bg: 'bg-green-500/10',
        };
      });
    
    const allNotifs = [...bookingNotifs, ...systemNotifications]
      .map(n => ({ ...n, read: n.read || readIds.has(n.id) }))
      .filter(n => !deletedIds.has(n.id));

    setLocalNotifications(allNotifs);
  }, [tickets, user?.id]); // Only runs on ticket updates; manual reads update state directly.

  const handleMarkAllAsRead = () => {
    const newReadIds = new Set(readIds);
    localNotifications.forEach(n => newReadIds.add(n.id));
    setReadIds(newReadIds);
    localStorage.setItem('notification_read_ids', JSON.stringify([...newReadIds]));
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkAsRead = (id: string) => {
    const newReadIds = new Set(readIds).add(id);
    setReadIds(newReadIds);
    localStorage.setItem('notification_read_ids', JSON.stringify([...newReadIds]));
    setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = (id: string) => {
    const newDeletedIds = new Set(deletedIds).add(id);
    setDeletedIds(newDeletedIds);
    localStorage.setItem('notification_deleted_ids', JSON.stringify([...newDeletedIds]));
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = localNotifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = localNotifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl p-8 border border-white/5 flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl p-8 border border-white/5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-gray-400 text-sm">Your bookings and system updates.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-background rounded-lg p-1 border border-white/10">
            <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-surface-light text-white' : 'text-gray-400 hover:text-white'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'unread' ? 'bg-surface-light text-white' : 'text-gray-400 hover:text-white'}`}>Unread</button>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="text-sm text-primary hover:text-primary-hover transition-colors font-medium whitespace-nowrap">
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  key={notification.id} 
                  className={`p-4 rounded-xl border transition-colors flex gap-4 group items-start ${
                    notification.read ? 'bg-background/50 border-white/5' : 'bg-surface-light border-white/10'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notification.bg}`}>
                    <Icon className={`w-6 h-6 ${notification.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-semibold truncate ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">{notification.time}</span>
                    </div>
                    <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-400'}`}>
                      {notification.message}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button onClick={() => handleMarkAsRead(notification.id)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Mark as read">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(notification.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete notification">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2 group-hover:hidden" />
                  )}
                </motion.div>
              );
            })
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
              <p className="text-gray-400 text-sm">
                {filter === 'unread' ? "You're all caught up! No new notifications." : "You don't have any notifications yet."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
