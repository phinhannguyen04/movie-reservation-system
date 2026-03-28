import React, { useState, useMemo } from 'react';
import { DataTable } from '@/components/admin/ui/DataTable';
import { Modal } from '@/components/admin/ui/Modal';
import { AdvancedFilterModal, FilterConfig } from '@/components/admin/ui/AdvancedFilterModal';
import { useAuth } from '@/contexts/AuthContext';
import { useData, User } from '@/contexts/DataContext';
import { Search, User as UserIcon, Shield, Lock, CheckCircle, AlertCircle, LayoutGrid } from 'lucide-react';
import { AdminHeader } from '@/components/admin/ui/AdminHeader';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useDataTable } from '@/hooks/useDataTable';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function AdminUsers() {
  const { user: authUser } = useAuth();
  const { users, updateUser, deleteUser } = useData();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Filter Config ──────────────────────────────────────────────
  const uniqueRoles = useMemo(() => Array.from(new Set(users.map(u => u.role))), [users]);

  const filterConfig: FilterConfig = {
    selects: [
      {
        id: 'status',
        label: 'Account Status',
        allLabel: 'All Statuses',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'locked', label: 'Locked' },
        ]
      },
      {
        id: 'role',
        label: 'User Role',
        allLabel: 'All Roles',
        options: uniqueRoles.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))
      }
    ],
    sortOptions: [
      { id: 'newest', label: 'Newest Members', sub: 'Joined date descending' },
      { id: 'name_az', label: 'Name (A-Z)', sub: 'Alphabetical' },
      { id: 'name_za', label: 'Name (Z-A)', sub: 'Reverse alphabetical' },
    ]
  };

  const {
    filters,
    handleFilterChange,
    resetFilters,
    applyFilters,
    processedData,
    activeFiltersCount
  } = useDataTable<User>({
    initialData: users,
    filterLogic: (u, f) => {
      const matchStatus = !f.status || f.status === 'all' || u.status === f.status;
      const matchRole = !f.role || f.role === 'all' || u.role === f.role;
      return matchStatus && matchRole;
    },
    sortLogic: (a, b, opt) => {
      if (opt === 'name_az') return a.name.localeCompare(b.name);
      if (opt === 'name_za') return b.name.localeCompare(a.name);
      return b.id.localeCompare(a.id); // newest as default
    }
  });

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
    showToast('success', 'User account updated');
    setIsEditOpen(false);
    setEditingUser(null);
  };

  // ── Columns ────────────────────────────────────────────────────
  const columns = [
    {
      header: 'Customer',
      accessor: 'name' as const,
      render: (item: User) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={item.name} avatar={item.avatar} size="md" />
          <div>
            <p className="font-bold text-white group-hover/row:text-primary transition-colors">{item.name}</p>
            <p className="text-[10px] text-gray-500 font-medium">{item.email}</p>
          </div>
        </div>
      ),
    },
    { 
       header: 'Phone', 
       accessor: 'phone' as const, 
       render: (item: User) => <span className="text-xs font-mono text-gray-400">{item.phone || '—'}</span> 
    },
    {
      header: 'Role',
      accessor: 'role' as const,
      render: (item: User) => (
        <div className="flex items-center gap-2">
           <Shield className="w-3 h-3 text-gray-500" />
           <span className="text-xs font-bold text-gray-400 capitalize">{item.role}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (item: User) => {
        let sc = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        let Icon = Lock;
        if (item.status === 'active') {
          sc = 'bg-green-500/10 text-green-400 border-green-500/20';
          Icon = CheckCircle;
        } else if (item.status === 'locked') {
          sc = 'bg-red-500/10 text-red-400 border-red-500/20';
        }
        
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${sc}`}>
            <Icon className="w-3 h-3" />
            {item.status}
          </span>
        );
      },
    },
  ];

  const isAdmin = authUser?.role === 'admin';

  return (
    <div className="h-full relative flex flex-col gap-8">
      <AdminHeader 
        title="Identity Directory"
        description="Monitor and manage the global user registry. Audit access levels and account security statuses."
        category="Identity Management"
        icon={UserIcon}
      />

      <div className="flex-1 min-h-0">
        <DataTable 
          title="Principal Accounts" 
          description="High-fidelity list of all registered identities within the system network."
          data={processedData} 
          columns={columns} 
          searchPlaceholder="Audit identities by name, email, or role..."
          onFilterClick={() => setIsFilterOpen(true)}
          filterButtonActive={activeFiltersCount > 0}
          onEdit={isAdmin ? handleEdit : undefined}
          onDelete={isAdmin ? (item) => {
            if(confirm(`Revoke access for ${item.name}?`)) {
              deleteUser(item.id);
              showToast('success', 'User access revoked');
            }
          } : undefined}
        />
      </div>

      {/* Advanced Filter Modal */}
      <AdvancedFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Audit User Database"
        config={filterConfig}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        onApply={applyFilters}
      />

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditingUser(null); }} title="Modify Security Principal">
        <form onSubmit={handleEditSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Full Legal Name</label>
              <input name="name" required type="text" defaultValue={editingUser?.name} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Primary Email</label>
              <input name="email" required type="email" defaultValue={editingUser?.email} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Contact Number</label>
                <input name="phone" type="text" defaultValue={editingUser?.phone} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="+1 555 000 0000" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Current Status</label>
                <select name="status" required defaultValue={editingUser?.status} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all appearance-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Assigned Policy Role</label>
              <select name="role" required defaultValue={editingUser?.role} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all appearance-none">
                <option value="customer">Standard Customer</option>
                <option value="vip">Premium VIP</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <button type="button" onClick={() => { setIsEditOpen(false); setEditingUser(null); }} className="px-6 py-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all text-sm font-bold">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-white text-black hover:bg-white/90 rounded-xl transition-all text-sm font-black uppercase tracking-widest shadow-xl shadow-white/5">Update Principal</button>
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
