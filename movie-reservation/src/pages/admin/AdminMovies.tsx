import React, { useState, useMemo } from 'react';
import { Movie } from '@/data/mock';
import { DataTable } from '@/components/admin/ui/DataTable';
import { Modal } from '@/components/admin/ui/Modal';
import { AdvancedFilterModal, FilterConfig } from '@/components/admin/ui/AdvancedFilterModal';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useDataTable } from '@/hooks/useDataTable';
import { CheckCircle, AlertCircle, Plus, Film } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { motion, AnimatePresence } from 'motion/react';

export function AdminMovies() {
  const { user } = useAuth();
  const { movies: data, addMovie, updateMovie, deleteMovie } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const now = new Date();

  // ── Filter Logic ───────────────────────────────────────────
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    data.forEach(m => m.genre.forEach(g => set.add(g)));
    return Array.from(set).sort();
  }, [data]);

  const filterConfig: FilterConfig = {
    selects: [
      {
        id: 'status',
        label: 'Release Status',
        allLabel: 'All Statuses',
        options: [
          { value: 'showing', label: 'Now Showing' },
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'ended', label: 'Ended' },
        ]
      },
      {
        id: 'rating',
        label: 'Age Rating',
        allLabel: 'All Ratings',
        options: ['G', 'PG', 'PG-13', 'R'].map(r => ({ value: r, label: r }))
      },
      {
        id: 'genre',
        label: 'Movie Genre',
        allLabel: 'All Genres',
        options: allGenres.map(g => ({ value: g, label: g }))
      }
    ],
    sortOptions: [
      { id: 'newest', label: 'Recently Added', sub: 'Latest records first' },
      { id: 'alphabetical', label: 'Alphabetical', sub: 'A to Z' },
      { id: 'duration_long', label: 'Longest Duration', sub: 'Descending' },
      { id: 'duration_short', label: 'Shortest Duration', sub: 'Ascending' },
    ]
  };

  const {
    filters,
    handleFilterChange,
    resetFilters,
    applyFilters,
    processedData,
    activeFiltersCount
  } = useDataTable<Movie>({
    initialData: data,
    filterLogic: (m, f) => {
      const releaseDate = new Date(m.releaseDate);
      const endDate = m.endDate ? new Date(m.endDate) : null;
      let status = 'upcoming';
      if (releaseDate <= now && (!endDate || endDate >= now)) status = 'showing';
      else if (endDate && endDate < now) status = 'ended';

      const matchStatus = !f.status || f.status === 'all' || f.status === status;
      const matchRating = !f.rating || f.rating === 'all' || m.rating === f.rating;
      const matchGenre = !f.genre || f.genre === 'all' || m.genre.includes(f.genre);
      
      return matchStatus && matchRating && matchGenre;
    },
    sortLogic: (a, b, opt) => {
      if (opt === 'alphabetical') return a.title.localeCompare(b.title);
      if (opt === 'duration_long') return b.duration - a.duration;
      if (opt === 'duration_short') return a.duration - b.duration;
      // newest (default if ID contains timestamp-like structure, otherwise just stable)
      return b.id.localeCompare(a.id);
    }
  });

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const moviePayload: Movie = {
      id: editingMovie?.id || `m${Date.now()}`,
      title: formData.get('title') as string,
      duration: parseInt(formData.get('duration') as string) || 120,
      releaseDate: formData.get('releaseDate') as string,
      endDate: formData.get('endDate') as string,
      rating: formData.get('rating') as string,
      genre: (formData.get('genre') as string).split(',').map(g => g.trim()),
      posterUrl: formData.get('posterUrl') as string || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=200',
      backdropUrl: formData.get('backdropUrl') as string || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=1200',
      synopsis: formData.get('synopsis') as string || 'A newly added movie.',
      trailerUrl: formData.get('trailerUrl') as string,
      director: formData.get('director') as string || 'TBD',
      cast: (formData.get('cast') as string || 'TBD').split(',').map(s => s.trim()),
    };

    if (editingMovie) {
      updateMovie(moviePayload);
      showToast('success', 'Movie updated successfully');
    } else {
      addMovie(moviePayload);
      showToast('success', 'Movie added successfully');
    }
    setIsModalOpen(false);
    setEditingMovie(null);
  };

  const handleEdit = (item: Movie) => {
    setEditingMovie(item);
    setIsModalOpen(true);
  };

  // ── Columns ────────────────────────────────────────────────────
  const columns = [
    { 
      header: 'Title', 
      accessor: 'title' as const,
      render: (item: Movie) => (
        <div className="flex items-center gap-3">
          <div className="relative group/poster">
             <img src={item.posterUrl} alt={item.title} className="w-10 h-14 object-cover rounded-lg bg-white/5 border border-white/10 shadow-lg group-hover/poster:scale-105 transition-transform" />
          </div>
          <div>
            <p className="font-bold text-white group-hover/row:text-primary transition-colors">{item.title}</p>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{item.genre.slice(0, 2).join(' • ')}</p>
          </div>
        </div>
      )
    },
    { 
       header: 'Duration', 
       accessor: 'duration' as const, 
       render: (item: Movie) => (
         <span className="font-mono text-xs text-gray-400">{item.duration}m</span>
       )
    },
    { 
       header: 'Release Date', 
       accessor: 'releaseDate' as const,
       render: (item: Movie) => (
         <span className="text-xs font-bold text-gray-500">{item.releaseDate}</span>
       )
    },
    { 
       header: 'Rating', 
       accessor: 'rating' as const,
       render: (item: Movie) => (
         <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-black text-gray-400">
           {item.rating}
         </span>
       )
    },
    { 
       header: 'Status', 
       accessor: 'id' as const, 
       render: (movie: Movie) => {
          const releaseDate = new Date(movie.releaseDate);
          const endDate = movie.endDate ? new Date(movie.endDate) : null;
          if (releaseDate > now) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-amber-500/10 text-amber-400 border border-amber-500/20">Upcoming</span>;
          if (endDate && endDate < now) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-gray-500/10 text-gray-400 border border-gray-500/20">Ended</span>;
          return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-green-500/10 text-green-400 border border-green-500/20">Now Showing</span>;
       }
    },
  ];

  const canCrud = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="h-full relative flex flex-col gap-8">
      <PageHeader 
        title="Production Registry"
        description="Curate and manage the cinematic library. Monitor active screenings and production metadata."
        category="Content Node"
        icon={Film}
        actions={
          canCrud ? (
            <button 
              onClick={() => { setEditingMovie(null); setIsModalOpen(true); }}
              className="px-6 py-4 bg-white text-black hover:bg-white/90 rounded-2xl transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-white/5 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Register Film
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 min-h-0">
        <DataTable 
          title="Active Catalogue" 
          description="High-fidelity list of all production assets available for scheduling." 
          data={processedData} 
          columns={columns} 
          searchPlaceholder="Search movie title, director or cast..."
          onFilterClick={() => setIsFilterOpen(true)}
          filterButtonActive={activeFiltersCount > 0}
          onEdit={canCrud ? handleEdit : undefined}
          onDelete={canCrud ? (item) => {
             if(confirm(`Are you sure you want to delete "${item.title}"?`)) {
                deleteMovie(item.id);
                showToast('success', 'Movie deleted');
             }
          } : undefined}
        />
      </div>

      {/* Advanced Transformation Modal */}
      <AdvancedFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Transform Movie Catalog"
        config={filterConfig}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        onApply={applyFilters}
      />

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingMovie(null); }} title={editingMovie ? 'Edit Movie' : 'Add New Movie'}>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Movie Title</label>
              <input name="title" required type="text" defaultValue={editingMovie?.title} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="e.g. Inception" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Duration (min)</label>
                <input name="duration" required type="number" defaultValue={editingMovie?.duration} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="120" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Age Rating</label>
                <select name="rating" required defaultValue={editingMovie?.rating || 'PG-13'} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all appearance-none">
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Release Date</label>
                <input name="releaseDate" required type="date" defaultValue={editingMovie?.releaseDate} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">End Date</label>
                <input name="endDate" type="date" defaultValue={editingMovie?.endDate} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Genres</label>
                <input name="genre" required type="text" defaultValue={editingMovie?.genre.join(', ')} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="Action, Sci-Fi" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Director</label>
                <input name="director" type="text" defaultValue={editingMovie?.director} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="Christopher Nolan" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Poster URL</label>
                <input name="posterUrl" type="text" defaultValue={editingMovie?.posterUrl} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Backdrop URL</label>
                <input name="backdropUrl" type="text" defaultValue={editingMovie?.backdropUrl} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Trailer URL (YouTube Embed)</label>
              <input name="trailerUrl" type="text" defaultValue={editingMovie?.trailerUrl} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="https://www.youtube.com/embed/..." />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Cast (Comma separated)</label>
              <input name="cast" type="text" defaultValue={editingMovie?.cast.join(', ')} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="Actor 1, Actor 2" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Synopsis</label>
              <textarea name="synopsis" rows={3} defaultValue={editingMovie?.synopsis} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all resize-none" placeholder="Movie description..." />
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingMovie(null); }} className="px-6 py-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all text-sm font-bold">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-white text-black hover:bg-white/90 rounded-xl transition-all text-sm font-black uppercase tracking-widest shadow-xl shadow-white/5">{editingMovie ? 'Save Changes' : 'Publish Movie'}</button>
          </div>
        </form>
      </Modal>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
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
