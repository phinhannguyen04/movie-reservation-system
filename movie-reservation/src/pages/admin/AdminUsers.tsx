import React, { useState, useMemo } from 'react';
import { DataTable } from '@/components/admin/ui/DataTable';
import { Modal } from '@/components/admin/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useData, User } from '@/contexts/DataContext';

export function AdminUsers() {
  const { user: authUser } = useAuth();
  const { users, updateUser, deleteUser } = useData();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // ── Filtered data ──────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return users.filter(u => {
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchStatus && matchRole;
    });
  }, [users, statusFilter, roleFilter]);

  // ── Edit handler ──────────────────────────────────────────────
  const handleEdit = (item: User) => {
    setEditingUser(item);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const fd = new FormData(e.target as HTMLFormElement);
    const updated: User = {
      ...editingUser,
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      role: fd.get('role') as string,
      status: fd.get('status') as 'active' | 'inactive' | 'locked',
    };
    updateUser(updated);
    setIsEditOpen(false);
    setEditingUser(null);
  };

  // Deduce unique roles from data
  const uniqueRoles = useMemo(() => Array.from(new Set(users.map(u => u.role))), [users]);

  // ── Columns ────────────────────────────────────────────────────
  const columns = [
    {
      header: 'Full Name',
      accessor: 'name' as const,
      render: (item: User) => <span className="font-medium text-white">{item.name}</span>,
    },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Phone', accessor: 'phone' as const, render: (item: User) => <span className="text-gray-400">{item.phone || '—'}</span> },
    {
      header: 'Role',
      accessor: 'role' as const,
      render: (item: User) => <span className="capitalize text-gray-300">{item.role}</span>,
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (item: User) => {
        let sc = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        if (item.status === 'active') sc = 'bg-green-500/10 text-green-400 border-green-500/20';
        else if (item.status === 'locked') sc = 'bg-red-500/10 text-red-400 border-red-500/20';
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${sc}`}>
            {item.status}
          </span>
        );
      },
    },
  ];

  const isAdmin = authUser?.role === 'admin';

  // ── Custom Filters ─────────────────────────────────────────────
  const customFilters = (
    <div className="flex items-center gap-2">
      <select
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value)}
        className="bg-background border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary px-3 py-2"
      >
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="locked">Locked</option>
      </select>
      <select
        value={roleFilter}
        onChange={e => setRoleFilter(e.target.value)}
        className="bg-background border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary px-3 py-2"
      >
        <option value="all">All Roles</option>
        {uniqueRoles.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] relative">
      <DataTable
        title="User Management"
        description="View registered customers, manage their accounts, and enforce access controls."
        data={filteredData}
        columns={columns}
        searchPlaceholder="Search by name, email, or phone..."
        customFilters={customFilters}
        onEdit={isAdmin ? handleEdit : undefined}
        onDelete={isAdmin ? (item) => deleteUser(item.id) : undefined}
      />

      {/* ── Edit User Modal ─────────────────────────── */}
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditingUser(null); }} title="Edit User Account">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input name="name" required type="text" defaultValue={editingUser?.name} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input name="email" required type="email" defaultValue={editingUser?.email} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <input name="phone" type="text" defaultValue={editingUser?.phone} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="+1 555 123 4567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Account Status</label>
              <select name="status" required defaultValue={editingUser?.status} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select name="role" required defaultValue={editingUser?.role} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none">
              <option value="customer">Customer</option>
              <option value="vip">VIP Customer</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => { setIsEditOpen(false); setEditingUser(null); }} className="px-4 py-2 hover:bg-white/5 text-white rounded-lg transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
