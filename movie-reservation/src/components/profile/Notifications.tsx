import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Ticket, Star, Info, CheckCircle2, Trash2, Check } from 'lucide-react';

const initialNotifications = [
  {
    id: 1,
    type: 'ticket',
    title: 'Booking Confirmed',
    message: 'Your tickets for "Dune: Part Two" have been confirmed. Enjoy the movie!',
    time: '2 hours ago',
    read: false,
    icon: Ticket,
    color: 'text-primary',
    bg: 'bg-primary/10'
  },
  {
    id: 2,
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
    id: 3,
    type: 'system',
    title: 'App Update',
    message: 'We have updated our app with new features and performance improvements.',
    time: '3 days ago',
    read: true,
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    id: 4,
    type: 'ticket',
    title: 'Rate your experience',
    message: 'How was your experience watching "Oppenheimer"? Leave a review now.',
    time: '1 week ago',
    read: true,
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  }
];

export function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <p className="text-gray-400 text-sm">Stay updated with your bookings and offers.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-background rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-surface-light text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'unread' ? 'bg-surface-light text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Unread
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-sm text-primary hover:text-primary-hover transition-colors font-medium whitespace-nowrap"
            >
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
                  className={`p-4 rounded-xl border transition-colors flex gap-4 group items-center ${
                    notification.read 
                      ? 'bg-background/50 border-white/5' 
                      : 'bg-surface-light border-white/10'
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
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 group-hover:hidden" />
                  )}
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
              <p className="text-gray-400 text-sm">
                {filter === 'unread' 
                  ? "You're all caught up! No new notifications." 
                  : "You don't have any notifications yet."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
