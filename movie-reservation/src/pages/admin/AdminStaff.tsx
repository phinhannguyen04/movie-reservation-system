import React, { useState } from 'react';
import { DataTable } from '@/components/admin/ui/DataTable';
import { Modal } from '@/components/admin/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Staff } from '@/contexts/DataContext';
import { Shield, Check, X, UserPlus } from 'lucide-react';

// ── Role Permission Definitions ──────────────────────────────────
export const SYSTEM_ROLES = [
  {
    id: 'admin',
    label: 'Super Admin',
    description: 'Full system access. Can manage everything including staff and settings.',
    color: 'text-red-400 bg-red-500/10 border-red-500/20',
  },
  {
    id: 'manager',
    label: 'Cinema Manager',
    description: 'Manages movies, cinemas, showtimes, and tickets. Cannot manage staff or settings.',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'staff',
    label: 'Box Office',
    description: 'Can only view dashboard and manage ticket sales.',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
];

export const PERMISSION_MATRIX: Record<string, Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }>> = {
  admin: {
    dashboard: { view: true, add: false, edit: false, delete: false },
    movies:    { view: true, add: true, edit: true, delete: true },
    cinemas:   { view: true, add: true, edit: true, delete: true },
    showtimes: { view: true, add: true, edit: true, delete: true },
    tickets:   { view: true, add: true, edit: true, delete: true },
    users:     { view: true, add: false, edit: true, delete: true },
    staff:     { view: true, add: true, edit: true, delete: true },
    settings:  { view: true, add: false, edit: true, delete: false },
  },
  manager: {
    dashboard: { view: true, add: false, edit: false, delete: false },
    movies:    { view: true, add: true, edit: true, delete: false },
    cinemas:   { view: true, add: true, edit: true, delete: false },
    showtimes: { view: true, add: true, edit: true, delete: true },
    tickets:   { view: true, add: false, edit: true, delete: false },
    users:     { view: true, add: false, edit: false, delete: false },
    staff:     { view: false, add: false, edit: false, delete: false },
    settings:  { view: false, add: false, edit: false, delete: false },
  },
  staff: {
    dashboard: { view: true, add: false, edit: false, delete: false },
    movies:    { view: false, add: false, edit: false, delete: false },
    cinemas:   { view: false, add: false, edit: false, delete: false },
    showtimes: { view: false, add: false, edit: false, delete: false },
    tickets:   { view: true, add: true, edit: true, delete: false },
    users:     { view: false, add: false, edit: false, delete: false },
    staff:     { view: false, add: false, edit: false, delete: false },
    settings:  { view: false, add: false, edit: false, delete: false },
  },
};

const MODULES = ['dashboard', 'movies', 'cinemas', 'showtimes', 'tickets', 'users', 'staff', 'settings'];

export function AdminStaff() {
  const { user } = useAuth();
  const { staff, addStaff, updateStaff, deleteStaff } = useData();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'roles'>('list');

  // ── Invite Staff Submit ──────────────────────────────────────────
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const newStaff: Staff = {
      id: `s${Date.now()}`,
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      role: fd.get('role') as string,
      status: 'active',
    };
    addStaff(newStaff);
    setIsInviteOpen(false);
  };

  // ── Edit Staff Submit ──────────────────────────────────────────
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    const fd = new FormData(e.target as HTMLFormElement);
    const updated: Staff = {
      ...editingStaff,
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      role: fd.get('role') as string,
      status: fd.get('status') as 'active' | 'inactive',
    };
    updateStaff(updated);
    setIsEditOpen(false);
    setEditingStaff(null);
  };

  const handleEdit = (item: Staff) => {
    setEditingStaff(item);
    setIsEditOpen(true);
  };

  // ── Columns ────────────────────────────────────────────────────
  const columns = [
    { header: 'Staff Member', accessor: 'name' as const, render: (item: Staff) => <span className="font-medium text-white">{item.name}</span> },
    { header: 'Email', accessor: 'email' as const },
    {
      header: 'Role',
      accessor: 'role' as const,
      render: (item: Staff) => {
        const roleDef = SYSTEM_ROLES.find(r => r.id === item.role);
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleDef?.color || 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}>
            <Shield className="w-3 h-3" />
            {roleDef?.label || item.role}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (item: Staff) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${item.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
          {item.status}
        </span>
      ),
    },
  ];

  const isAdmin = user?.role === 'admin';

  // ── RENDER ─────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-8rem)] relative flex flex-col gap-6">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-surface rounded-xl border border-white/5 p-1 w-fit">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          Staff Members
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'roles' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Shield className="w-4 h-4" />
          Roles & Permissions
        </button>
      </div>

      {/* ── Tab: Staff List ───────────────────────────── */}
      {activeTab === 'list' && (
        <div className="flex-1 min-h-0">
          <DataTable
            title="Staff & Roles Management"
            description="Control system access for administrators and operational staff."
            data={staff}
            columns={columns}
            onAdd={isAdmin ? () => setIsInviteOpen(true) : undefined}
            addLabel="Invite Staff"
            searchPlaceholder="Search staff members..."
            onEdit={isAdmin ? handleEdit : undefined}
            onDelete={isAdmin ? (item) => deleteStaff(item.id) : undefined}
          />
        </div>
      )}

      {/* ── Tab: Roles & Permissions Matrix ───────────────── */}
      {activeTab === 'roles' && (
        <div className="bg-surface rounded-xl border border-white/5 overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white mb-1">Role Permission Matrix</h2>
            <p className="text-sm text-gray-400">Visual overview of each role's capabilities across all system modules.</p>
          </div>

          {/* Role Description Cards */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-white/10">
            {SYSTEM_ROLES.map(role => (
              <div key={role.id} className={`rounded-xl border p-4 ${role.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-bold text-sm">{role.label}</span>
                </div>
                <p className="text-xs opacity-80">{role.description}</p>
              </div>
            ))}
          </div>

          {/* Permission Table */}
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-gray-400 font-medium">
                  <th className="px-6 py-4 sticky left-0 bg-surface z-10">Module</th>
                  {SYSTEM_ROLES.map(role => (
                    <th key={role.id} className="px-4 py-4 text-center" colSpan={4}>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${role.color}`}>
                        {role.label}
                      </span>
                    </th>
                  ))}
                </tr>
                <tr className="bg-white/[0.02] border-b border-white/10 text-gray-500 text-xs">
                  <th className="px-6 py-2 sticky left-0 bg-surface z-10"></th>
                  {SYSTEM_ROLES.map(role => (
                    <React.Fragment key={role.id}>
                      <th className="px-2 py-2 text-center">View</th>
                      <th className="px-2 py-2 text-center">Add</th>
                      <th className="px-2 py-2 text-center">Edit</th>
                      <th className="px-2 py-2 text-center">Delete</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MODULES.map(mod => (
                  <tr key={mod} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 sticky left-0 bg-surface z-10 capitalize font-medium text-white">{mod}</td>
                    {SYSTEM_ROLES.map(role => {
                      const perms = PERMISSION_MATRIX[role.id]?.[mod];
                      return (
                        <React.Fragment key={role.id}>
                          {['view', 'add', 'edit', 'delete'].map(action => (
                            <td key={action} className="px-2 py-3 text-center">
                              {perms?.[action as keyof typeof perms] ? (
                                <Check className="w-4 h-4 text-green-400 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-red-400/40 mx-auto" />
                              )}
                            </td>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Invite Staff Modal ────────────────────────── */}
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite New Staff Member">
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-300">
            <UserPlus className="w-5 h-5 flex-shrink-0" />
            The new staff member will receive an email invitation to set up their account.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input name="name" required type="text" className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="e.g. Jane Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input name="email" required type="email" className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="jane@cinemax.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Assign Role</label>
            <select name="role" required className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none">
              {SYSTEM_ROLES.map(r => (
                <option key={r.id} value={r.id}>{r.label} — {r.description.slice(0, 50)}...</option>
              ))}
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsInviteOpen(false)} className="px-4 py-2 hover:bg-white/5 text-white rounded-lg transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Send Invitation
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Staff Modal ────────────────────────── */}
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditingStaff(null); }} title="Edit Staff Member">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input name="name" required type="text" defaultValue={editingStaff?.name} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input name="email" required type="email" defaultValue={editingStaff?.email} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
              <select name="role" required defaultValue={editingStaff?.role} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none">
                {SYSTEM_ROLES.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select name="status" required defaultValue={editingStaff?.status} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => { setIsEditOpen(false); setEditingStaff(null); }} className="px-4 py-2 hover:bg-white/5 text-white rounded-lg transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
