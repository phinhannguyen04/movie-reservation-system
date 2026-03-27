import React, { useState, useMemo } from 'react';
import { Cinema, Room } from '@/data/mock';
import { DataTable } from '@/components/admin/ui/DataTable';
import { Modal } from '@/components/admin/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Plus, Trash2, MonitorPlay } from 'lucide-react';

export function AdminCinemas() {
  const { user } = useAuth();
  const { cinemas: data, addCinema, updateCinema, deleteCinema } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);

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
    } else {
      addCinema(cinemaPayload);
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
    const newRoom: Room = {
      id: `r${Date.now()}`,
      name: fd.get('roomName') as string,
      capacity: parseInt(fd.get('capacity') as string) || 100,
      format: fd.get('format') as '2D' | '3D' | 'IMAX',
    };
    const updatedCinema = { ...selectedCinema, rooms: [...selectedCinema.rooms, newRoom] };
    updateCinema(updatedCinema);
    setSelectedCinema(updatedCinema);
    (e.target as HTMLFormElement).reset();
  };

  const handleDeleteRoom = (roomId: string) => {
    if (!selectedCinema) return;
    const updatedCinema = { ...selectedCinema, rooms: selectedCinema.rooms.filter(r => r.id !== roomId) };
    updateCinema(updatedCinema);
    setSelectedCinema(updatedCinema);
  };

  // ── Columns ────────────────────────────────────────────────
  const columns = [
    { header: 'Cinema ID', accessor: 'id' as Extract<keyof Cinema, string> },
    { 
      header: 'Cinema Name', 
      accessor: 'name' as Extract<keyof Cinema, string>,
      render: (item: Cinema) => <span className="font-medium text-white">{item.name}</span>
    },
    { header: 'Address', accessor: 'address' as Extract<keyof Cinema, string> },
    {
      header: 'Rooms',
      accessor: 'id' as Extract<keyof Cinema, string>,
      render: (item: Cinema) => (
        <button
          onClick={() => handleOpenRooms(item)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          {item.rooms.length} Room{item.rooms.length !== 1 ? 's' : ''}
        </button>
      )
    },
    { 
      header: 'Status', 
      accessor: 'distance' as Extract<keyof Cinema, string>,
      render: () => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
          Operational
        </span>
      )
    }
  ];

  const canCrud = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="h-[calc(100vh-8rem)] relative">
      <DataTable 
        title="Cinemas & Rooms" 
        description="Manage cinema locations, configure rooms, and seating layouts." 
        data={data} 
        columns={columns} 
        onAdd={canCrud ? () => { setEditingCinema(null); setIsModalOpen(true); } : undefined}
        addLabel="Add Cinema"
        searchPlaceholder="Search cinemas..."
        onEdit={canCrud ? handleEdit : undefined}
        onDelete={canCrud ? (item) => deleteCinema(item.id) : undefined}
      />

      {/* ── Add/Edit Cinema Modal ─────────────────────── */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingCinema(null); }} title={editingCinema ? 'Edit Cinema' : 'Add New Cinema'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cinema Name</label>
            <input name="name" required type="text" defaultValue={editingCinema?.name} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="e.g. Cinemax Downtown" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Location Address</label>
            <input name="address" required type="text" defaultValue={editingCinema?.address} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="123 Main St, City" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingCinema(null); }} className="px-4 py-2 hover:bg-white/5 text-white rounded-lg transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium">{editingCinema ? 'Save Changes' : 'Add Cinema'}</button>
          </div>
        </form>
      </Modal>

      {/* ── Room Management Modal ──────────────────────── */}
      <Modal isOpen={isRoomModalOpen} onClose={() => { setIsRoomModalOpen(false); setSelectedCinema(null); }} title={`Rooms — ${selectedCinema?.name || ''}`}>
        <div className="space-y-4">
          {/* Existing Rooms */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedCinema?.rooms.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No rooms configured yet.</p>
            )}
            {selectedCinema?.rooms.map(room => (
              <div key={room.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <MonitorPlay className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-white">{room.name}</p>
                    <p className="text-xs text-gray-500">{room.capacity} seats · {room.format}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors bg-white/5 hover:bg-red-400/10"
                  title="Remove Room"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Room Inline Form */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-sm font-medium text-gray-300 mb-3">Add New Room</p>
            <form onSubmit={handleAddRoom} className="flex items-end gap-2">
              <div className="flex-1">
                <input name="roomName" required type="text" className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" placeholder="Room name" />
              </div>
              <div className="w-20">
                <input name="capacity" required type="number" defaultValue={100} className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" placeholder="Seats" />
              </div>
              <div className="w-24">
                <select name="format" required className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none">
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                </select>
              </div>
              <button type="submit" className="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors" title="Add Room">
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
