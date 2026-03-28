import React, { useState, useMemo } from 'react';
import { Booking } from '@/data/mock';
import { DataTable } from '@/components/admin/ui/DataTable';
import { AdvancedFilterModal, FilterConfig } from '@/components/admin/ui/AdvancedFilterModal';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useDataTable } from '@/hooks/useDataTable';
import { Ticket, Calendar, MapPin, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export function AdminTickets() {
  const { user } = useAuth();
  const { tickets: data, deleteTicket, movies, cinemas, showtimes } = useData();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Filter Config ──────────────────────────────────────────────
  const filterConfig: FilterConfig = {
    selects: [
      {
        id: 'movie',
        label: 'Feature Film',
        allLabel: 'All Movies',
        options: movies.map(m => ({ value: m.id, label: m.title })),
        placeholder: "Search movie title..."
      },
      {
        id: 'cinema',
        label: 'Cinema Location',
        allLabel: 'All Cinemas',
        options: cinemas.map(c => ({ value: c.id, label: c.name })),
        placeholder: "Search location..."
      },
      {
        id: 'status',
        label: 'Transaction Status',
        allLabel: 'All Statuses',
        options: [
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'watched', label: 'Watched' },
          { value: 'cancelled', label: 'Cancelled' },
        ]
      }
    ],
    dates: [
      { id: 'bookingDate', label: 'Transaction Date' }
    ],
    sortOptions: [
      { id: 'newest', label: 'Latest Transactions', sub: 'Recency priority' },
      { id: 'oldest', label: 'Historical Records', sub: 'Archive order' },
      { id: 'price_desc', label: 'High Revenue', sub: 'Price descending' },
    ]
  };

  const {
    filters,
    handleFilterChange,
    resetFilters,
    applyFilters,
    processedData,
    activeFiltersCount
  } = useDataTable<Booking>({
    initialData: data,
    filterLogic: (t, f) => {
      const matchMovie = !f.movie || f.movie === 'all' || t.movieId === f.movie;
      const matchCinema = !f.cinema || f.cinema === 'all' || t.cinemaId === f.cinema;
      const matchStatus = !f.status || f.status === 'all' || t.status === f.status;
      const matchDate = !f.bookingDate || (() => {
        try {
          const d = new Date(t.bookingDate);
          return !isNaN(d.getTime()) && t.bookingDate.startsWith(f.bookingDate);
        } catch {
          return false;
        }
      })();
      return matchMovie && matchCinema && matchStatus && matchDate;
    },
    sortLogic: (a, b, opt) => {
      if (opt === 'newest') return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
      if (opt === 'oldest') return new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();
      if (opt === 'price_desc') return (b.totalPrice || 0) - (a.totalPrice || 0);
      return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
    }
  });

  const columns = [
    { 
       header: 'Transaction ID', 
       accessor: 'id' as const,
       render: (item: Booking) => (
         <div className="flex flex-col">
            <span className="font-mono text-[10px] text-gray-500 font-black uppercase tracking-widest">#{item.id.substring(0, 8)}</span>
            <span className="text-[9px] font-bold text-primary/60 mt-0.5">Verified Ticket</span>
         </div>
       )
    },
    { 
      header: 'Audit Logic', 
      accessor: 'movieTitle' as const,
      render: (item: Booking) => (
        <div className="flex flex-col gap-1 max-w-[200px]">
           <span className="font-bold text-white group-hover/row:text-primary transition-colors truncate">{item.movieTitle || movies.find(m => m.id === item.movieId)?.title}</span>
           <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium tracking-tight">
              <MapPin className="w-2.5 h-2.5" /> 
              <span className="truncate">{item.cinemaName || cinemas.find(c => c.id === item.cinemaId)?.name}</span>
           </div>
        </div>
      )
    },
    { 
      header: 'Timeline', 
      accessor: 'showtime' as const,
      render: (item: Booking) => (
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              {new Date(item.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
           </div>
           <div className="flex items-center gap-1.5 text-xs font-black text-primary">
              <Clock className="w-3.5 h-3.5" />
              {item.showtime || showtimes.find(s => s.id === item.showtimeId)?.time}
           </div>
        </div>
      )
    },
    { 
      header: 'Resources', 
      accessor: 'seats' as const,
      render: (item: Booking) => (
        <div className="flex flex-wrap gap-1">
           {item.seats.map(s => (
             <span key={s} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-gray-400">
                {s}
             </span>
           ))}
        </div>
      )
    },
    { 
      header: 'Value', 
      accessor: 'totalPrice' as const,
      render: (item: Booking) => (
        <div className="flex flex-col">
           <span className="font-black text-primary text-sm">${item.totalPrice.toFixed(2)}</span>
           <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Revenue</span>
        </div>
      )
    },
    { 
      header: 'Protocol State', 
      accessor: 'status' as const,
      render: (item: Booking) => {
        let sc = "bg-gray-500/10 text-gray-400 border-gray-500/20";
        let Icon = Clock;
        
        if (item.status === 'confirmed') {
          sc = "bg-green-500/10 text-green-400 border-green-500/20";
          Icon = CheckCircle;
        } else if (item.status === 'cancelled') {
          sc = "bg-red-500/10 text-red-400 border-red-500/20";
          Icon = XCircle;
        } else if (item.status === 'watched') {
          sc = "bg-blue-500/10 text-blue-400 border-blue-500/20";
          Icon = CheckCircle;
        }
        
        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest shadow-lg shadow-black/20",
            sc
          )}>
            <Icon className="w-3 h-3" />
            {item.status}
          </span>
        );
      }
    }
  ];

  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="h-full relative flex flex-col gap-6">
      <DataTable 
        title="Transaction Ledger" 
        description="Encrypted audit log of all customer reservations, financial throughput, and ticket lifecycles." 
        data={processedData} 
        columns={columns} 
        onDelete={canDelete ? (item) => {
           if(confirm(`REVOCATION ALERT: Permanently invalidate transaction #${item.id.substring(0,8)}?`)) {
              deleteTicket(item.id);
              showToast('success', 'Transaction invalidated and cleared from ledger');
           }
        } : undefined}
        searchPlaceholder="Find records by transaction fingerprint..."
        onFilterClick={() => setIsFilterOpen(true)}
        filterButtonActive={activeFiltersCount > 0}
      />

      <AdvancedFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Financial Log"
        config={filterConfig}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        onApply={applyFilters}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "fixed bottom-10 right-10 z-[100] flex items-center gap-4 px-8 py-5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border backdrop-blur-2xl",
              toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            )}
          >
             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", toast.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30')}>
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-60">System Security Notification</p>
                <p className="font-bold text-sm tracking-tight">{toast.message}</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
