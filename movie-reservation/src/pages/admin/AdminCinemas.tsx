import React, { useState, useMemo } from 'react';
import { Cinema, Room } from '@/data/mock';
import { DataTable } from '@/components/admin/ui/DataTable';
import { Modal } from '@/components/admin/ui/Modal';
import { AdvancedFilterModal, FilterConfig } from '@/components/admin/ui/AdvancedFilterModal';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useDataTable } from '@/hooks/useDataTable';
import { MapPin, Plus, CheckCircle, AlertCircle, MonitorPlay, Trash2, Building2, LayoutGrid } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { motion, AnimatePresence } from 'motion/react';

export function AdminCinemas() {
  const { user } = useAuth();
  const { cinemas: data, addCinema, updateCinema, deleteCinema, addRoom, deleteRoom } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Filter Config ──────────────────────────────────────────────
  const filterConfig: FilterConfig = {
    selects: [
      {
        id: 'roomCount',
        label: 'Complexity',
        allLabel: 'Any Capacity',
        options: [
          { value: 'small', label: '1-2 Rooms' },
          { value: 'medium', label: '3-5 Rooms' },
          { value: 'large', label: 'More than 5' },
        ]
      }
    ],
    sortOptions: [
      { id: 'alphabetical', label: 'Name (A-Z)', sub: 'Alphabetical' },
      { id: 'rooms_desc', label: 'Most Rooms', sub: 'Capacity priority' },
      { id: 'newest', label: 'Recently Added', sub: 'Creation date' },
    ]
  };

  const {
    filters,
    handleFilterChange,
    resetFilters,
    applyFilters,
    processedData,
    activeFiltersCount
  } = useDataTable<Cinema>({
    initialData: data,
    filterLogic: (c, f) => {
      if (f.roomCount === 'small') return c.rooms.length <= 2;
      if (f.roomCount === 'medium') return c.rooms.length > 2 && c.rooms.length <= 5;
      if (f.roomCount === 'large') return c.rooms.length > 5;
      return true;
    },
    sortLogic: (a, b, opt) => {
      if (opt === 'alphabetical') return a.name.localeCompare(b.name);
      if (opt === 'rooms_desc') return b.rooms.length - a.rooms.length;
      return b.id.localeCompare(a.id);
    }
  });

  // ── Cinema Add/Edit ────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const cinemaPayload: Cinema = {
      id: editingCinema?.id || `c${Date.now()}`,
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      distance: editingCinema?.distance || '0 km',
      rooms: editingCinema?.rooms || [],
    };

    if (editingCinema) {
      updateCinema(cinemaPayload);
      showToast('success', 'Cinema details updated');
    } else {
      addCinema(cinemaPayload);
      showToast('success', 'New cinema location established');
    }
    setIsModalOpen(false);
    setEditingCinema(null);
  };

  const handleEdit = (item: Cinema) => {
    setEditingCinema(item);
    setIsModalOpen(true);
  };

  // ── Room Management ────────────────────────────────────────
  const handleOpenRooms = (cinema: Cinema) => {
    setSelectedCinema(cinema);
    setIsRoomModalOpen(true);
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCinema) return;
    const fd = new FormData(e.target as HTMLFormElement);
    const newRoom = {
      name: fd.get('roomName') as string,
      capacity: parseInt(fd.get('capacity') as string) || 100,
      format: fd.get('format') as '2D' | '3D' | 'IMAX',
    };
    
    addRoom(selectedCinema.id, newRoom).then(() => {
       showToast('success', `Room "${newRoom.name}" initialized`);
    }).catch(() => {
       showToast('error', 'Failed to save room configuration');
    });
    
    (e.target as HTMLFormElement).reset();
  };

  const handleDeleteRoom = (roomId: string) => {
    if (!selectedCinema) return;
    deleteRoom(selectedCinema.id, roomId).then(() => {
       showToast('success', 'Room decommissioned');
    }).catch(() => {
       showToast('error', 'Decommission protocol failed');
    });
  };

  // ── Columns ────────────────────────────────────────────────
  const columns = [
    { 
      header: 'Location', 
      accessor: 'name' as const,
      render: (item: Cinema) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-white group-hover/row:text-primary transition-colors">{item.name}</p>
            <p className="flex items-center gap-1 text-[10px] text-gray-500 font-medium tracking-tight">
               <MapPin className="w-2.5 h-2.5" /> {item.address}
            </p>
          </div>
        </div>
      )
    },
    { 
       header: 'Infrastructure', 
       accessor: 'id' as const,
       render: (item: Cinema) => (
        <button
          onClick={() => handleOpenRooms(item)}
          className="group/roomchip inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-gray-400 border border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all active:scale-95"
        >
          <MonitorPlay className="w-3.5 h-3.5 group-hover/roomchip:animate-pulse" />
          {item.rooms.length} Units
        </button>
      )
    },
    { 
      header: 'Audit Status', 
      accessor: 'distance' as const,
      render: () => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 shadow-lg shadow-green-500/5">
          <CheckCircle className="w-3 h-3" />
          Operational
        </span>
      )
    }
  ];

  const canCrud = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="h-full relative flex flex-col gap-8">
      <PageHeader 
        title="Cinema Infrastructure"
        description="Configure physical theater nodes, manage screen configurations, and monitor hardware status."
        category="Asset Management"
        icon={MonitorPlay}
        actions={
          user?.role === 'admin' ? (
            <button 
              onClick={() => { setEditingCinema(null); setIsModalOpen(true); }}
              className="px-6 py-4 bg-white text-black hover:bg-white/90 rounded-2xl transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-white/5 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Provision Cinema
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 min-h-0">
        <DataTable 
          title="Active Infrastructure" 
          description="High-fidelity list of all physical assets and theater nodes."
          data={processedData} 
          columns={columns} 
          searchPlaceholder="Find cinemas by identity or location..."
          onFilterClick={() => setIsFilterOpen(true)}
          filterButtonActive={activeFiltersCount > 0}
          onEdit={canCrud ? handleEdit : undefined}
          onDelete={canCrud ? (item) => {
             if(confirm(`DESTRUCTIVE ACTION: Remove "${item.name}" from active infrastructure?`)) {
                deleteCinema(item.id);
                showToast('success', 'Cinema infrastructure purged');
             }
          } : undefined}
        />
      </div>

      {/* Advanced Filter Modal */}
      <AdvancedFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Audit Node Network"
        config={filterConfig}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        onApply={applyFilters}
      />

      {/* Add/Edit Cinema Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingCinema(null); }} title={editingCinema ? 'Modify Cinema Node' : 'Initialize Cinema Node'}>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Node Name</label>
              <input name="name" required type="text" defaultValue={editingCinema?.name} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="e.g. Cinemax Downtown" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Geographic Identifier</label>
              <input name="address" required type="text" defaultValue={editingCinema?.address} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="123 Main St, City" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingCinema(null); }} className="px-6 py-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all text-sm font-bold">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-white text-black hover:bg-white/90 rounded-xl transition-all text-sm font-black uppercase tracking-widest shadow-xl shadow-white/5">{editingCinema ? 'Update Node' : 'Initialize Node'}</button>
          </div>
        </form>
      </Modal>

      {/* Room Management Modal */}
      <Modal isOpen={isRoomModalOpen} onClose={() => { setIsRoomModalOpen(false); setSelectedCinema(null); }} title={`Infrastructure Audit — ${selectedCinema?.name || ''}`}>
        <div className="space-y-8 py-2">
          {/* Static Stats Headers */}
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Units</p>
                <p className="text-xl font-bold text-white">{data.find(c => c.id === selectedCinema?.id)?.rooms.length || 0}</p>
             </div>
             <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Capacity</p>
                <p className="text-xl font-bold text-primary">{data.find(c => c.id === selectedCinema?.id)?.rooms.reduce((acc, r) => acc + r.capacity, 0) || 0}</p>
             </div>
             <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Status</p>
                <p className="text-xl font-bold text-green-400">OK</p>
             </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Active Unit List</h3>
            {selectedCinema?.rooms.length === 0 && (
              <div className="p-8 text-center text-gray-600 border-2 border-dashed border-white/5 rounded-2xl">
                 No units configured for this node.
              </div>
            )}
            {data.find(c => c.id === selectedCinema?.id)?.rooms.map(room => (
              <div key={room.id} className="group/unit flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 transition-colors group-hover/unit:bg-primary/10 group-hover/unit:border-primary/20">
                    <MonitorPlay className="w-5 h-5 text-gray-500 group-hover/unit:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-tight">{room.name}</p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.1em]">{room.capacity} SLOTS • {room.format} PROTOCOL</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="p-2.5 text-gray-600 hover:text-red-400 rounded-xl transition-all hover:bg-red-400/10 active:scale-90"
                  title="Revoke Unit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-6 space-y-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Initialize New Unit</h3>
            <form onSubmit={handleAddRoom} className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1">
                <input name="roomName" required type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all placeholder-gray-600" placeholder="Room label (e.g. ALPHA)" />
              </div>
              <div className="w-24">
                <input name="capacity" required type="number" defaultValue={100} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="Slots" />
              </div>
              <div className="w-28 relative">
                <select name="format" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all appearance-none uppercase font-black tracking-widest">
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                </select>
              </div>
              <button type="submit" className="w-full sm:w-16 h-11 bg-white text-black hover:bg-white/90 rounded-xl transition-all flex items-center justify-center shadow-lg active:scale-90" title="Initialize Unit">
                <Plus className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
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
