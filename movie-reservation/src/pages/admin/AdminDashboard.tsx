import React, { useMemo } from 'react';
import { Film, Ticket, Users, Calendar } from 'lucide-react';
import { StatCard } from '@/components/admin/ui/StatCard';
import { useData } from '@/contexts/DataContext';

export function AdminDashboard() {
  const { tickets, movies, showtimes } = useData();

  const { totalRevenue, ticketsSold, activeMovies, upcomingShowtimes } = useMemo(() => {
    return {
      totalRevenue: tickets.reduce((acc, t) => acc + (t.totalPrice || 0), 0),
      ticketsSold: tickets.length,
      activeMovies: movies.length,
      upcomingShowtimes: showtimes.length
    };
  }, [tickets, movies, showtimes]);

  const recentBookings = useMemo(() => {
    return [...tickets]
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
      .slice(0, 5);
  }, [tickets]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to the Cinemax Admin Control Panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={Ticket} 
          trend="0%" 
          trendUp={true} 
        />
        <StatCard 
          title="Tickets Sold" 
          value={ticketsSold.toLocaleString()} 
          icon={Ticket} 
          trend="0%" 
          trendUp={true} 
        />
        <StatCard 
          title="Active Movies" 
          value={activeMovies.toString()} 
          icon={Film} 
          trend="0%" 
          trendUp={true} 
        />
        <StatCard 
          title="System Showtimes" 
          value={upcomingShowtimes.toString()} 
          icon={Calendar} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Recent Bookings</h2>
              <button className="text-sm text-primary hover:text-primary-hover">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="pb-3 font-medium">Ticket ID</th>
                    <th className="pb-3 font-medium">Movie</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">No recent bookings found.</td>
                    </tr>
                  ) : (
                    recentBookings.map((b) => {
                      const mTitle = b.movieTitle || movies.find(m => m.id === b.movieId)?.title || 'Unknown';
                      return (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 font-mono text-xs">{b.id}</td>
                          <td className="py-3 font-medium text-white max-w-[150px] truncate" title={mTitle}>{mTitle}</td>
                          <td className="py-3 text-gray-400">{new Date(b.bookingDate).toLocaleString()}</td>
                          <td className="py-3 text-right font-medium text-primary">${(b.totalPrice || 0).toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-xl border border-white/5 p-6 h-full">
            <h2 className="text-lg font-bold mb-6">Recent Activity</h2>
            <div className="space-y-6">
              {recentBookings.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No activity recorded.</p>
              ) : (
                recentBookings.map((activity) => {
                  const mTitle = activity.movieTitle || movies.find(m => m.id === activity.movieId)?.title || 'Unknown Movie';
                  const isCancel = activity.status === 'cancelled';
                  return (
                    <div key={`act-${activity.id}`} className="flex gap-4">
                      <div className="mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          isCancel ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {isCancel ? 'Ticket Cancelled' : 'New Booking'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          Ticket {activity.id.substring(0, 8)} for {mTitle}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(activity.bookingDate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
