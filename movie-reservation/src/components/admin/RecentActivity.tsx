import React from 'react';
import { Clock } from 'lucide-react';
import { Booking } from '@/data/mock';

interface RecentActivityProps {
  tickets: Booking[];
}

export function RecentActivity({ tickets }: RecentActivityProps) {
  return (
    <div className="bg-surface rounded-xl border border-white/5 p-6 shadow-xl relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
        <Clock className="w-5 h-5 text-primary" />
        Recent Activity
      </h2>
      <div className="space-y-6 relative z-10">
        {tickets.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No activity recorded.
          </p>
        ) : (
          tickets.slice(0, 6).map((activity) => {
            const isCancel = activity.status === "cancelled";
            return (
              <div key={`act-${activity.id}`} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full mt-1.5 ring-4 ring-background z-10 ${
                      isCancel ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                    }`}
                  />
                  <div className="w-[1px] h-full bg-white/10 group-last:hidden"></div>
                </div>
                <div className="flex-1 min-w-0 pb-6 group-last:pb-0">
                  <p className="text-sm font-semibold text-white">
                    {isCancel ? "Ticket Cancelled" : "New Booking"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 truncate font-medium">
                    {activity.movieTitle}
                  </p>
                  <p className="text-[10px] text-primary/60 mt-2 font-bold uppercase tracking-tight">
                    {new Date(activity.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {activity.userName || "Guest"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
