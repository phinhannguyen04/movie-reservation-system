import React, { useMemo, useState, useCallback } from "react";
import { Film, Ticket, Calendar, User, RefreshCw, Layers, LayoutGrid } from "lucide-react";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable } from "@/components/admin/ui/DataTable";
import { AdvancedFilterModal, FilterConfig } from "@/components/admin/ui/AdvancedFilterModal";
import { useData } from "@/contexts/DataContext";
import { Booking } from "@/data/mock";
import { useDataTable } from "@/hooks/useDataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { BookingStatusBadge } from "@/components/admin/BookingStatusBadge";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { BookingDetailsModal } from "@/components/admin/BookingDetailsModal";
import { SkeletonCard, SkeletonRow } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export function AdminDashboard() {
  const { tickets, movies, showtimes, refreshTickets, loading: dataLoading } = useData();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // -- Filter Logic --
  const movieOptions = useMemo(() => {
    const titles = Array.from(new Set(movies.map(m => m.title))).sort();
    return titles.map(t => ({ value: t, label: t }));
  }, [movies]);

  const filterConfig: FilterConfig = {
    selects: [
      {
        id: "movie",
        label: "Feature Film",
        allLabel: "All Movies",
        options: movieOptions,
        placeholder: "Search movie title..."
      },
      {
        id: "customerType",
        label: "User Identity",
        allLabel: "All Types",
        options: [
          { value: "registered", label: "Registered Accounts" },
          { value: "guest", label: "Guest Checkouts" }
        ]
      }
    ],
    dates: [
      { id: "bookingDate", label: "Transaction Date" }
    ],
    sortOptions: [
      { id: "newest", label: "Latest Transactions", sub: "Recency priority" },
      { id: "oldest", label: "Historical Records", sub: "Oldest first" },
      { id: "price_high", label: "High Value", sub: "Maximum revenue" },
      { id: "price_low", label: "Low Value", sub: "Minimum revenue" },
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
    initialData: tickets,
    filterLogic: (t, f) => {
      const matchMovie = !f.movie || f.movie === "all" || t.movieTitle === f.movie;
      const matchDate = !f.bookingDate || (() => {
        try {
          const d = new Date(t.bookingDate);
          return !isNaN(d.getTime()) && d.toISOString().split('T')[0] === f.bookingDate;
        } catch {
          return false;
        }
      })();
      const matchCustomer = !f.customerType || f.customerType === "all" || 
        (f.customerType === "registered" && t.userName && t.userName !== "Guest") ||
        (f.customerType === "guest" && (!t.userName || t.userName === "Guest"));
      
      return matchMovie && matchDate && matchCustomer;
    },
    sortLogic: (a, b, opt) => {
      if (opt === "oldest") return new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();
      if (opt === "newest") return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
      if (opt === "price_high") return (b.totalPrice || 0) - (a.totalPrice || 0);
      if (opt === "price_low") return (a.totalPrice || 0) - (b.totalPrice || 0);
      return 0;
    }
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTickets();
      showToast("Data synchronization complete", "success");
    } catch (err) {
      showToast("Real-time sync failed", "error");
    } finally {
      setRefreshing(false);
    }
  }, [refreshTickets, showToast]);

  const stats = useMemo(() => {
    return {
      totalRevenue: tickets.reduce((acc, t) => acc + (t.totalPrice || 0), 0),
      ticketsSold: tickets.length,
      activeMovies: movies.length,
      upcomingShowtimes: showtimes.length,
    };
  }, [tickets, movies, showtimes]);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const columns = [
    { 
      header: "Identity", 
      accessor: "id" as keyof Booking,
      render: (b: Booking) => (
        <div className="flex flex-col">
           <span className="font-mono text-[10px] text-gray-500 font-black uppercase tracking-widest">#{b.id.substring(0, 8)}</span>
           <span className="text-[9px] font-bold text-primary/60 mt-0.5">Verified Transaction</span>
        </div>
      )
    },
    { 
      header: "Production", 
      accessor: "movieTitle" as keyof Booking,
      render: (b: Booking) => (
        <div className="max-w-[180px]">
          <p className="font-bold text-white truncate" title={b.movieTitle}>{b.movieTitle}</p>
          <p className="text-[10px] text-gray-500 font-medium">Standard Screening</p>
        </div>
      )
    },
    { 
      header: "Principal", 
      accessor: "userName" as keyof Booking,
      render: (b: Booking) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar name={b.userName || "Guest Patron"} avatar={undefined} size="md" />
          <div className="flex flex-col">
             <span className="text-xs font-bold text-gray-300">{b.userName || "Guest Patron"}</span>
             <span className="text-[10px] text-gray-600 font-medium">{b.userName ? 'Registered Account' : 'Guest Patron'}</span>
          </div>
        </div>
      )
    },
    { 
      header: "Timestamp", 
      accessor: "bookingDate" as keyof Booking,
      render: (b: Booking) => (
        <div className="flex flex-col">
          <span className="text-white font-bold text-xs">
            {new Date(b.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">
            {new Date(b.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )
    },
    { 
      header: "Gross Amount", 
      accessor: "totalPrice" as keyof Booking,
      render: (b: Booking) => (
        <div className="flex flex-col">
           <span className="font-black text-primary text-sm">${(b.totalPrice || 0).toFixed(2)}</span>
           <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">USD Revenue</span>
        </div>
      )
    },
    { 
      header: "Protocol Status", 
      accessor: "status" as keyof Booking,
      render: (b: Booking) => <BookingStatusBadge status={b.status} />
    }
  ];

  return (
    <div className="space-y-10 pb-16">
      <PageHeader 
        title="Command Center"
        description="Monitor theater performance, manage logical resources, and oversee real-time reservation throughput."
        category="System Live"
        icon={LayoutGrid}
        actions={
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-xl shadow-black/20 group/date transition-all hover:border-white/10">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Calendar className="w-5 h-5 text-primary" />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current System Date</span>
                  <span className="text-sm font-bold text-white">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span>
               </div>
            </div>
            
            <button 
              onClick={handleRefresh} 
              disabled={refreshing || dataLoading}
              className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-white/90 transition-all shadow-xl shadow-white/5 active:scale-90 group/refresh disabled:opacity-50"
              title="Synchronize Database"
            >
               <RefreshCw className={cn("w-6 h-6 transition-transform duration-700", refreshing ? 'animate-spin' : 'group-hover:rotate-180')} />
            </button>
          </div>
        }
      />

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dataLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Gross Revenue" value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={Ticket} trend="+12.5%" trendUp={true} />
            <StatCard title="Total Inventory sold" value={stats.ticketsSold.toLocaleString()} icon={Layers} trend="+5.2%" trendUp={true} />
            <StatCard title="Active Productions" value={stats.activeMovies.toString()} icon={Film} trend="0%" trendUp={true} />
            <StatCard title="Scheduled Showtimes" value={stats.upcomingShowtimes.toString()} icon={LayoutGrid} trend="+2 New" trendUp={true} />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3 min-h-[600px]">
          {dataLoading ? (
            <div className="bg-surface p-10 rounded-3xl border border-white/5">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : (
            <DataTable
              title="Transaction Log"
              description="Monitor secure bookings and manage reservation lifecycle protocols."
              data={processedData}
              columns={columns}
              searchPlaceholder="Find records by ID, production, or patron identity..."
              itemsPerPage={12}
              onEdit={(b) => handleViewDetails(b)}
              onFilterClick={() => setIsFilterModalOpen(true)}
              filterButtonActive={activeFiltersCount > 0}
              isLoading={refreshing}
            />
          )}
        </div>

        <div className="space-y-8">
           <RecentActivity tickets={tickets} />
           
           <div className="relative group overflow-hidden rounded-3xl p-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-primary/10 to-transparent blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-surface/80 backdrop-blur-xl border border-white/10 rounded-[22px] p-8 text-center space-y-4">
                 <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 mx-auto flex items-center justify-center mb-2">
                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(255,51,0,0.8)]" />
                 </div>
                 <h3 className="text-xl font-bold text-white tracking-tight">System Resilience</h3>
                 <p className="text-xs text-gray-500 font-medium leading-relaxed">
                   All architectural layers are performing within optimal latency parameters. Security protocols active.
                 </p>
                 <div className="pt-2">
                   <button className="px-6 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-primary/20 w-full">
                      View Infrastructure Audit
                   </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Advanced Global Filter Modal */}
      <AdvancedFilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Transaction Data Transformation"
        config={filterConfig}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        onApply={applyFilters}
      />

      <BookingDetailsModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} booking={selectedBooking} />
    </div>
  );
}

