import React, { useState, useMemo } from 'react';
import { Movie } from '@/data/mock';
import { DataTable } from '@/components/admin/ui/DataTable';
import { Modal } from '@/components/admin/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { SearchableSelect } from '@/components/admin/ui/SearchableSelect';
import { api } from '@/services/api';
import { RefreshCw, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AdminMovies() {
  const { user } = useAuth();
  const { movies: data, addMovie, updateMovie, deleteMovie } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Filters ─────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');

  const now = new Date();

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    data.forEach(m => m.genre.forEach(g => set.add(g)));
    return Array.from(set).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(m => {
      // Status logic
      const releaseDate = new Date(m.releaseDate);
      const endDate = m.endDate ? new Date(m.endDate) : null;
      let status = 'upcoming';
      if (releaseDate <= now && (!endDate || endDate >= now)) status = 'showing';
      else if (endDate && endDate < now) status = 'ended';

      const matchStatus = statusFilter === 'all' || statusFilter === status;
      const matchRating = ratingFilter === 'all' || m.rating === ratingFilter;
      const matchGenre = genreFilter === 'all' || m.genre.includes(genreFilter);
      return matchStatus && matchRating && matchGenre;
    });
  }, [data, statusFilter, ratingFilter, genreFilter]);

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
    } else {
      addMovie(moviePayload);
    }
    setIsModalOpen(false);
    setEditingMovie(null);
  };

  const handleEdit = (item: Movie) => {
    setEditingMovie(item);
    setIsModalOpen(true);
  };

  // ── Status badge logic ──────────────────────────────────────
  const getStatusBadge = (movie: Movie) => {
    const releaseDate = new Date(movie.releaseDate);
    const endDate = movie.endDate ? new Date(movie.endDate) : null;
    if (releaseDate > now) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Upcoming</span>;
    if (endDate && endDate < now) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">Ended</span>;
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Now Showing</span>;
  };

  const columns = [
    { 
      header: 'Title', 
      accessor: 'title' as Extract<keyof Movie, string>,
      render: (item: Movie) => (
        <div className="flex items-center gap-3">
          <img src={item.posterUrl} alt={item.title} className="w-10 h-14 object-cover rounded bg-white/5" />
          <div>
            <p className="font-medium text-white">{item.title}</p>
            <p className="text-xs text-gray-500">{item.genre.slice(0, 2).join(', ')}</p>
          </div>
        </div>
      )
    },
    { header: 'Duration', accessor: 'duration' as Extract<keyof Movie, string>, render: (item: Movie) => `${item.duration}m` },
    { header: 'Release Date', accessor: 'releaseDate' as Extract<keyof Movie, string> },
    { header: 'End Date', accessor: 'endDate' as Extract<keyof Movie, string>, render: (item: Movie) => item.endDate || '—' },
    { header: 'Rating', accessor: 'rating' as Extract<keyof Movie, string> },
    { header: 'Status', accessor: 'id' as Extract<keyof Movie, string>, render: (item: Movie) => getStatusBadge(item) },
  ];

  const canCrud = user?.role === 'admin' || user?.role === 'manager';

  // ── Custom Filters ─────────────────────────────────────────
  const customFilters = (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchableSelect
        options={[
          { value: 'showing', label: 'Now Showing' },
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'ended', label: 'Ended' },
        ]}
        value={statusFilter}
        onChange={setStatusFilter}
        allLabel="All Statuses"
        placeholder="Search status..."
      />
      <SearchableSelect
        options={['G', 'PG', 'PG-13', 'R'].map(r => ({ value: r, label: r }))}
        value={ratingFilter}
        onChange={setRatingFilter}
        allLabel="All Ratings"
        placeholder="Search rating..."
      />
      <SearchableSelect
        options={allGenres.map(g => ({ value: g, label: g }))}
        value={genreFilter}
        onChange={setGenreFilter}
        allLabel="All Genres"
        placeholder="Search genre..."
      />
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] relative">
      <DataTable 
        title="Movies Management" 
        description="View and manage the movie catalog, statuses, and details." 
        data={filteredData} 
        columns={columns} 
        onAdd={canCrud ? () => { setEditingMovie(null); setIsModalOpen(true); } : undefined}
        addLabel="Add Movie"
        searchPlaceholder="Search movie title..."
        customFilters={customFilters}
        onEdit={canCrud ? handleEdit : undefined}
        onDelete={canCrud ? (item) => deleteMovie(item.id) : undefined}
      />

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingMovie(null); }} title={editingMovie ? 'Edit Movie' : 'Add New Movie'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Movie Title</label>
            <input name="title" required type="text" defaultValue={editingMovie?.title} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="e.g. Inception" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Duration (minutes)</label>
              <input name="duration" required type="number" defaultValue={editingMovie?.duration} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="120" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Release Date</label>
              <input name="releaseDate" required type="date" defaultValue={editingMovie?.releaseDate} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
              <input name="endDate" type="date" defaultValue={editingMovie?.endDate} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Rating</label>
              <select name="rating" required defaultValue={editingMovie?.rating || 'PG-13'} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none">
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Genres (comma separated)</label>
            <input name="genre" required type="text" defaultValue={editingMovie?.genre.join(', ')} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="Action, Sci-Fi" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Director</label>
              <input name="director" type="text" defaultValue={editingMovie?.director} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="Christopher Nolan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Cast (comma separated)</label>
              <input name="cast" type="text" defaultValue={editingMovie?.cast.join(', ')} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="Actor 1, Actor 2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Synopsis</label>
            <textarea name="synopsis" rows={2} defaultValue={editingMovie?.synopsis} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="Brief description..."></textarea>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Poster URL</label>
              <input name="posterUrl" type="url" defaultValue={editingMovie?.posterUrl} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Backdrop URL</label>
              <input name="backdropUrl" type="url" defaultValue={editingMovie?.backdropUrl} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Trailer URL</label>
              <input name="trailerUrl" type="url" defaultValue={editingMovie?.trailerUrl} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="https://youtube.com/..." />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingMovie(null); }} className="px-4 py-2 hover:bg-white/5 text-white rounded-lg transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium">{editingMovie ? 'Save Changes' : 'Add Movie'}</button>
          </div>
        </form>
      </Modal>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
