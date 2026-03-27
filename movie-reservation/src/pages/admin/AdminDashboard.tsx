import React from 'react';
import { Film, Ticket, Users, Calendar } from 'lucide-react';
import { StatCard } from '@/components/admin/ui/StatCard';

const recentActivities = [
  { id: 1, action: 'New booking', details: 'Ticket #B-12345678 for Dune: Part Two', time: '5 minutes ago', status: 'success' },
  { id: 2, action: 'User registered', details: 'john.doe@example.com joined', time: '1 hour ago', status: 'info' },
  { id: 3, action: 'Ticket cancelled', details: 'Ticket #B-87654321 cancelled by user', time: '2 hours ago', status: 'warning' },
  { id: 4, action: 'Showtime added', details: 'Oppenheimer at Cinemax IMAX', time: '5 hours ago', status: 'success' },
];

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to the Cinemax Admin Control Panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="$24,500" 
          icon={Ticket} 
          trend="12.5%" 
          trendUp={true} 
        />
        <StatCard 
          title="Tickets Sold" 
          value="1,234" 
          icon={Ticket} 
          trend="8.2%" 
          trendUp={true} 
        />
        <StatCard 
          title="Active Movies" 
          value="12" 
          icon={Film} 
          trend="0.0%" 
          trendUp={true} 
        />
        <StatCard 
          title="Upcoming Showtimes" 
          value="48" 
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
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3">B-12345678</td>
                    <td className="py-3">Dune: Part Two</td>
                    <td className="py-3 text-gray-400">Today, 10:30 AM</td>
                    <td className="py-3 text-right font-medium">$30.00</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3">B-87654321</td>
                    <td className="py-3">Oppenheimer</td>
                    <td className="py-3 text-gray-400">Yesterday, 14:20</td>
                    <td className="py-3 text-right font-medium">$15.00</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3">B-55554444</td>
                    <td className="py-3">The Batman</td>
                    <td className="py-3 text-gray-400">Mar 24, 18:00</td>
                    <td className="py-3 text-right font-medium">$25.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-xl border border-white/5 p-6 h-full">
            <h2 className="text-lg font-bold mb-6">Recent Activity</h2>
            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
