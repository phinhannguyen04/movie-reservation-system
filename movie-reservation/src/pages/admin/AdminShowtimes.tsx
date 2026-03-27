import React, { useState, useMemo } from 'react';
import { Showtime } from '@/data/mock';
import { DataTable } from '@/components/admin/ui/DataTable';
import { Modal } from '@/components/admin/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { SearchableSelect } from '@/components/admin/ui/SearchableSelect';

export function AdminShowtimes() {
  const { user } = useAuth();
  const { showtimes: data, addShowtime, updateShowtime, deleteShowtime, movies, cinemas } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Filter state
  const [selectedMovie, setSelectedMovie] = useState<string>('all');
  const [selectedCinema, setSelectedCinema] = useState<string>('all');

  // Form state for modal
  const [formMovieId, setFormMovieId] = useState(movies[0]?.id || '');
  const [formCinemaId, setFormCinemaId] = useState(cinemas[0]?.id || '');
  const [formScreen, setFormScreen] = useState('');

  // Auto-close & filtering logic
  const now = new Date();
  const processedData = useMemo(() => {
    return data
      .filter(item => {
        const matchMovie = selectedMovie === 'all' || item.movieId === selectedMovie;
        const matchCinema = selectedCinema === 'all' || item.cinemaId === selectedCinema;
        return matchMovie && matchCinema;
      })
      .map(item => {
        const showtimeDate = new Date(`${item.date}T${item.time}`);
        const isPast = showtimeDate < now;
        return { ...item, isClosed: isPast };
      });
  }, [data, selectedMovie, selectedCinema]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const showtimePayload: Showtime = {
      id: editingId || `st${Date.now()}`,
      movieId: formData.get('movieId') as string,
      cinemaId: formData.get('cinemaId') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      screen: formData.get('screen') as string,
      format: formData.get('format') as '2D' | '3D' | 'IMAX'
    };

    if (editingId) {
      updateShowtime(showtimePayload);
    } else {
      addShowtime(showtimePayload);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormMovieId(movies[0]?.id || '');
    setFormCinemaId(cinemas[0]?.id || '');
    setFormScreen('');
  };

  const handleEdit = (item: Showtime) => {
    setEditingId(item.id);
    setFormMovieId(item.movieId);
    setFormCinemaId(item.cinemaId);
    setFormScreen(item.screen);
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Showtime ID', accessor: 'id' as Extract<keyof Showtime, string> },
    { 
      header: 'Movie', 
      accessor: 'movieId' as Extract<keyof Showtime, string>,
      render: (item: Showtime) => <span className="font-bold text-white">{movies.find(m => m.id === item.movieId)?.title || item.movieId}</span>
    },
    { 
      header: 'Cinema', 
      accessor: 'cinemaId' as Extract<keyof Showtime, string>,
      render: (item: Showtime) => <span className="text-gray-300">{cinemas.find(c => c.id === item.cinemaId)?.name || item.cinemaId}</span>
    },
    { header: 'Date', accessor: 'date' as Extract<keyof Showtime, string> },
    { header: 'Time', accessor: 'time' as Extract<keyof Showtime, string> },
    { header: 'Screen', accessor: 'screen' as Extract<keyof Showtime, string> },
    { 
      header: 'Status / Format', 
      accessor: 'format' as Extract<keyof Showtime, string>,
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {item.format}
          </span>
          {item.isClosed && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
              Closed
            </span>
          )}
        </div>
      )
    }
  ];

  const customFilters = (
    <div className="flex items-center gap-2">
      <SearchableSelect
        options={movies.map(m => ({ value: m.id, label: m.title }))}
        value={selectedMovie}
        onChange={setSelectedMovie}
        allLabel="All Movies"
        placeholder="Search movie..."
      />
      <SearchableSelect
        options={cinemas.map(c => ({ value: c.id, label: c.name }))}
        value={selectedCinema}
        onChange={setSelectedCinema}
        allLabel="All Cinemas"
        placeholder="Search cinema..."
      />
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] relative">
      <DataTable 
        title="Showtime Management" 
        description="Schedule movie screenings across all available cinema rooms." 
        data={processedData} 
        columns={columns} 
        onAdd={user?.role === 'admin' || user?.role === 'manager' ? () => { setEditingId(null); setFormMovieId(movies[0]?.id || ''); setFormCinemaId(cinemas[0]?.id || ''); setFormScreen(''); setIsModalOpen(true); } : undefined}
        onEdit={user?.role === 'admin' || user?.role === 'manager' ? handleEdit : undefined}
        onDelete={user?.role === 'admin' || user?.role === 'manager' ? (item) => deleteShowtime(item.id) : undefined}
        addLabel="Create Showtime"
        searchPlaceholder="Search screenings..."
        customFilters={customFilters}
      />

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingId(null); }} title={editingId ? "Edit Showtime" : "Create New Showtime"}>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Movie</label>
              <SearchableSelect
                name="movieId"
                options={movies.map(m => ({ value: m.id, label: m.title }))}
                value={formMovieId}
                onChange={setFormMovieId}
                showAll={false}
                placeholder="Search movie..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Cinema Location</label>
              <SearchableSelect
                name="cinemaId"
                options={cinemas.map(c => ({ value: c.id, label: c.name }))}
                value={formCinemaId}
                onChange={setFormCinemaId}
                showAll={false}
                placeholder="Search cinema..."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
              <input name="date" required type="date" className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
              <input name="time" required type="time" className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Screen / Room</label>
              <SearchableSelect
                name="screen"
                options={cinemas.flatMap(c => c.rooms.map(r => ({ value: r.name, label: `${c.name} — ${r.name} (${r.format}, ${r.capacity} seats)` })))}
                value={formScreen}
                onChange={setFormScreen}
                showAll={false}
                placeholder="Search room..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Format</label>
              <select name="format" required className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none">
                <option value="2D">Standard 2D</option>
                <option value="3D">RealD 3D</option>
                <option value="IMAX">IMAX</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-white/5 text-white rounded-lg transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium">Create Showtime</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
