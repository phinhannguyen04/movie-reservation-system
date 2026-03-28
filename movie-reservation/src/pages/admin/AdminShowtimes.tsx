import React, { useState, useMemo, useCallback } from 'react';
import { Showtime } from '@/data/mock';
import { DataTable } from '@/components/admin/ui/DataTable';
import { Modal } from '@/components/admin/ui/Modal';
import { AdvancedFilterModal, FilterConfig } from '@/components/admin/ui/AdvancedFilterModal';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useDataTable } from '@/hooks/useDataTable';
import { SearchableSelect } from '@/components/admin/ui/SearchableSelect';
import { AdminHeader } from '@/components/admin/ui/AdminHeader';
import { Calendar, Clock, MonitorPlay, CheckCircle, AlertCircle, Trash2, LayoutGrid, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export function AdminShowtimes() {
  const { user } = useAuth();
  const { showtimes: data, addShowtime, updateShowtime, deleteShowtime, movies, cinemas } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Form state for modal
  const [formMovieId, setFormMovieId] = useState('');
  const [formCinemaId, setFormCinemaId] = useState('');
  const [formScreen, setFormScreen] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');

  const now = new Date();

  // ── Filter Config ───────────────────────────────────────────
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
      }
    ],
    dates: [
      { id: 'date', label: 'Screening Date' }
    ],
    sortOptions: [
      { id: 'newest_date', label: 'Latest Date', sub: 'Chronological desc' },
      { id: 'oldest_date', label: 'Earliest Date', sub: 'Chronological asc' },
      { id: 'movie_az', label: 'Movie (A-Z)', sub: 'Alphabetical' },
    ]
  };

  const {
    filters,
    handleFilterChange,
    resetFilters,
    applyFilters,
    processedData,
    activeFiltersCount
  } = useDataTable<Showtime>({
    initialData: data,
    filterLogic: (s, f) => {
      const matchMovie = !f.movie || f.movie === 'all' || s.movieId === f.movie;
      const matchCinema = !f.cinema || f.cinema === 'all' || s.cinemaId === f.cinema;
      const matchDate = !f.date || s.date === f.date;
      return matchMovie && matchCinema && matchDate;
    },
    sortLogic: (a, b, opt) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      if (opt === 'newest_date') return dateB.getTime() - dateA.getTime();
      if (opt === 'oldest_date') return dateA.getTime() - dateB.getTime();
      if (opt === 'movie_az') {
         const titleA = movies.find(m => m.id === a.movieId)?.title || '';
         const titleB = movies.find(m => m.id === b.movieId)?.title || '';
         return titleA.localeCompare(titleB);
      }
      return dateA.getTime() - dateB.getTime();
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const showtimePayload: Showtime = {
      id: editingId || `st${Date.now()}`,
      movieId: formMovieId || (formData.get('movieId') as string),
      cinemaId: formCinemaId || (formData.get('cinemaId') as string),
      date: formDate || (formData.get('date') as string),
      time: formTime || (formData.get('time') as string),
      screen: formScreen || (formData.get('screen') as string),
      format: formData.get('format') as '2D' | '3D' | 'IMAX'
    };

    if (editingId) {
      updateShowtime(showtimePayload);
      showToast('success', 'Showtime updated successfully');
    } else {
      addShowtime(showtimePayload);
      showToast('success', 'New showtime established');
    }
    
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleEdit = (item: Showtime) => {
    setFormMovieId(item.movieId);
    setFormCinemaId(item.cinemaId);
    setFormScreen(item.screen);
    setFormDate(item.date);
    setFormTime(item.time);
    setIsModalOpen(true);
  };

  const columns = [
    { 
      header: 'Showtime Details', 
      accessor: 'id' as const,
      render: (item: Showtime) => {
         const movie = movies.find(m => m.id === item.movieId);
         const cinema = cinemas.find(c => c.id === item.cinemaId);
         return (
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                 <span className="font-bold text-white group-hover/row:text-primary transition-colors">{movie?.title || 'Unknown Film'}</span>
                 <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-gray-500 uppercase tracking-widest">{item.format}</span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                 <MonitorPlay className="w-2.5 h-2.5" /> {cinema?.name} • Room {item.screen}
              </p>
           </div>
         );
      }
    },
    { 
       header: 'Temporal Slot', 
       accessor: 'date' as const,
       render: (item: Showtime) => (
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
               <Calendar className="w-3.5 h-3.5 text-gray-500" />
               {item.date}
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-primary">
               <Clock className="w-3.5 h-3.5" />
               {item.time}
            </div>
         </div>
       )
    },
    { 
      header: 'Status Protocol', 
      accessor: 'id' as const,
      render: (item: Showtime) => {
        const showtimeDate = new Date(`${item.date}T${item.time}`);
        const isPast = showtimeDate < now;
        
        if (isPast) return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-500/10 text-gray-400 border border-gray-500/20">
             Legacy / Past
          </span>
        );
        
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
             Active / Scheduled
          </span>
        );
      }
    }
  ];

  // ── FILTERED ROOMS ──────────────────────────────────────────
  const filteredRooms = useMemo(() => {
    if (!formCinemaId) return [];
    const cinema = cinemas.find(c => c.id === formCinemaId);
    return cinema ? cinema.rooms.map(r => ({ value: r.name, label: `${r.name} (${r.format})` })) : [];
  }, [formCinemaId, cinemas]);

  const canCrud = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="h-full relative flex flex-col gap-8">
      <AdminHeader 
        title="Showtime Protocol"
        description="Synchronize movie screenings across theatrical nodes and manage spatial availability."
        category="Logistics"
        icon={MonitorPlay}
        actions={
          canCrud ? (
            <button 
              onClick={() => { 
                setEditingId(null); 
                setFormMovieId(movies[0]?.id || ''); 
                setFormCinemaId(cinemas[0]?.id || ''); 
                setFormScreen(''); 
                setIsModalOpen(true); 
              }}
              className="px-6 py-4 bg-white text-black hover:bg-white/90 rounded-2xl transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-white/5 flex items-center gap-2 active:scale-90"
            >
              <Plus className="w-4 h-4" /> Initialize Screening
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 min-h-0">
        <DataTable 
          title="Operational Schedule" 
          description="High-fidelity timeline of all active screenings. Monitor concurrency and theater utilization."
          data={processedData} 
          columns={columns} 
          searchPlaceholder="Find screenings by movie identity..."
          onFilterClick={() => setIsFilterOpen(true)}
          filterButtonActive={activeFiltersCount > 0}
          onEdit={canCrud ? handleEdit : undefined}
          onDelete={canCrud ? (item) => {
             if(confirm('Revoke this scheduled showtime? This may disrupt existing reservations.')) {
                deleteShowtime(item.id);
                showToast('success', 'Showtime slot revoked');
             }
          } : undefined}
        />
      </div>

      {/* Advanced Global Filter Modal */}
      <AdvancedFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Screening Database"
        config={filterConfig}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        onApply={applyFilters}
      />

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingId(null); }} title={editingId ? "Modify Slot Assignment" : "Initialize New Slot"}>
        <form onSubmit={handleAddSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Production</label>
                <SearchableSelect
                  options={movies.map(m => ({ value: m.id, label: m.title }))}
                  value={formMovieId}
                  onChange={setFormMovieId}
                  showAll={false}
                  placeholder="Select movie..."
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Theater Node</label>
                <SearchableSelect
                  options={cinemas.map(c => ({ value: c.id, label: c.name }))}
                  value={formCinemaId}
                  onChange={setFormCinemaId}
                  showAll={false}
                  placeholder="Select cinema..."
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Calendar Date</label>
                <div className="relative group">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                   <input 
                     name="date" 
                     required 
                     type="date" 
                     value={formDate}
                     onChange={(e) => setFormDate(e.target.value)}
                     className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" 
                   />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Temporal Slot</label>
                <div className="relative group">
                   <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                   <input 
                     name="time" 
                     required 
                     type="time" 
                     value={formTime}
                     onChange={(e) => setFormTime(e.target.value)}
                     className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" 
                   />
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
               <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Quick Selection Slots</span>
               <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Morning', time: '10:00' },
                    { label: 'Afternoon', time: '14:30' },
                    { label: 'Prime Time', time: '19:00' },
                    { label: 'Late Night', time: '22:15' }
                  ].map(slot => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setFormTime(slot.time)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                        formTime === slot.time 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-black/20 border-white/5 text-gray-400 hover:border-white/20"
                      )}
                    >
                      {slot.label} • {slot.time}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Spatial Unit (Room)</label>
                <SearchableSelect
                  options={filteredRooms}
                  value={formScreen}
                  onChange={setFormScreen}
                  showAll={false}
                  placeholder={formCinemaId ? "Select room..." : "Locked: Select Cinema first"}
                  className="w-full"
                  disabled={!formCinemaId}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Screen Protocol</label>
                <select name="format" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all appearance-none uppercase font-black tracking-widest">
                  <option value="2D">Standard 2D</option>
                  <option value="3D">RealD 3D</option>
                  <option value="IMAX">IMAX</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all text-sm font-bold">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-white text-black hover:bg-white/90 rounded-xl transition-all text-sm font-black uppercase tracking-widest shadow-xl shadow-white/5">{editingId ? "Finalize Changes" : "Create Linkage"}</button>
          </div>
        </form>
      </Modal>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
              toast.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
             </div>
             <p className="font-bold text-sm">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
