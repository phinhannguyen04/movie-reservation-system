import React, { useState, useMemo, useCallback } from 'react';
import { DataTable } from '@/components/admin/ui/DataTable';
import { Modal } from '@/components/admin/ui/Modal';
import { AdvancedFilterModal, FilterConfig } from '@/components/admin/ui/AdvancedFilterModal';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Check, X, UserPlus, Eye, Search, Trash2, ArrowRight, Layers, LayoutGrid, Users } from 'lucide-react';
import { AdminHeader } from '@/components/admin/ui/AdminHeader';
import { api } from '@/services/api';
import { useData, User, Staff } from '@/contexts/DataContext';
import { useDataTable } from '@/hooks/useDataTable';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

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
  const { staff, addStaff, updateStaff, deleteStaff, users } = useData();

  const [activeTab, setActiveTab] = useState<'list' | 'roles'>('list');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [inviteEmailSearch, setInviteEmailSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Invite Search Logic ──────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!inviteEmailSearch.trim()) return [];
    const query = inviteEmailSearch.toLowerCase();
    return users.filter(u => 
      u.email.toLowerCase().includes(query) || 
      u.name.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [inviteEmailSearch, users]);

  // ── Unified Filter Logic ─────────────────────────────────────────
  const filterConfig: FilterConfig = {
    selects: [
      {
        id: 'role',
        label: 'Policy Role',
        allLabel: 'All Staff Roles',
        options: SYSTEM_ROLES.map(r => ({ value: r.id, label: r.label }))
      },
      {
        id: 'status',
        label: 'Account State',
        allLabel: 'All States',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]
      }
    ],
    sortOptions: [
      { id: 'alphabetical', label: 'Name (A-Z)', sub: 'Alphabetical' },
      { id: 'privilege_desc', label: 'Top Privilege', sub: 'Admin priority' },
      { id: 'newest', label: 'Recently Hired', sub: 'Creation date' },
    ]
  };

  const {
    filters,
    handleFilterChange,
    resetFilters,
    applyFilters,
    processedData,
    activeFiltersCount
  } = useDataTable<Staff>({
    initialData: staff,
    filterLogic: (s, f) => {
      const matchRole = !f.role || f.role === 'all' || s.role === f.role;
      const matchStatus = !f.status || f.status === 'all' || s.status === f.status;
      return matchRole && matchStatus;
    },
    sortLogic: (a, b, opt) => {
      if (opt === 'alphabetical') return a.name.localeCompare(b.name);
      if (opt === 'privilege_desc') {
         const hierarchy = { admin: 3, manager: 2, staff: 1 };
         return (hierarchy[b.role as keyof typeof hierarchy] || 0) - (hierarchy[a.role as keyof typeof hierarchy] || 0);
      }
      return b.id.localeCompare(a.id);
    }
  });

  // ── Invite Staff Submit ──────────────────────────────────────────
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const fd = new FormData(e.target as HTMLFormElement);
    const roleId = fd.get('role') as string;
    addStaff({
      name: selectedUser.name,
      email: selectedUser.email,
      password: "password123",
      role: roleId,
    });
    showToast('success', `Security clearance granted to ${selectedUser.name} as ${roleId}`);
    setIsInviteOpen(false);
    setInviteEmailSearch('');
    setSelectedUser(null);
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
    showToast('success', 'Staff credentials updated');
    setIsEditOpen(false);
    setEditingStaff(null);
  };

  const handleEdit = (item: Staff) => {
    setEditingStaff(item);
    setIsEditOpen(true);
  };

  // ── Columns ────────────────────────────────────────────────────
  const columns = [
    { 
       header: 'Personnel', 
       accessor: 'name' as const, 
       render: (item: Staff) => (
         <div className="flex items-center gap-3">
             <UserAvatar name={item.name} avatar={undefined} size="md" />
            <div>
               <p className="font-bold text-white group-hover/row:text-primary transition-colors">{item.name}</p>
               <p className="text-[10px] text-gray-500 font-medium">{item.email}</p>
            </div>
         </div>
       )
    },
    {
      header: 'Policy Role',
      accessor: 'role' as const,
      render: (item: Staff) => {
        const roleDef = SYSTEM_ROLES.find(r => r.id === item.role);
        return (
          <span className={cn(
             "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border uppercase tracking-widest",
             roleDef?.color || 'text-gray-400 bg-gray-500/10 border-gray-500/20'
          )}>
            <Shield className="w-3 h-3" />
            {roleDef?.label || item.role}
          </span>
        );
      },
    },
    {
      header: 'Audit Status',
      accessor: 'status' as const,
      render: (item: Staff) => (
        <span className={cn(
           "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest",
           item.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        )}>
           {item.status === 'active' ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
           {item.status}
        </span>
      ),
    },
  ];

  const isAdmin = user?.role === 'admin';

  // ── RENDER ─────────────────────────────────────────────────────
  return (
    <div className="h-full relative flex flex-col gap-8">
      <AdminHeader 
        title="Command Hierarchy"
        description="Provision and manage executive privileges for the theater network personnel. Audit staff activity and permissions."
        category="Personnel Management"
        icon={Users}
        actions={
          <div className="flex items-center gap-4 bg-surface/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-2xl">
            <button
              onClick={() => setActiveTab('list')}
              className={cn(
                "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'list' 
                 ? "bg-primary text-white shadow-lg shadow-primary/20" 
                 : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              Staff Registry
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={cn(
                "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'roles' 
                 ? "bg-primary text-white shadow-lg shadow-primary/20" 
                 : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              <Shield className="w-4 h-4" />
              Policy Matrix
            </button>
          </div>
        }
      />

      {/* ── Tab: Personnel Registry ───────────────────────────── */}
      {activeTab === 'list' && (
        <div className="flex-1 min-h-0">
          <DataTable
            title="Operational Personnel"
            description="Manage administrative clearance, oversee operational roles, and audit system contributors."
            data={processedData}
            columns={columns}
            onAdd={isAdmin ? () => setIsInviteOpen(true) : undefined}
            addLabel="Onboard Staff"
            searchPlaceholder="Find personnel by identity or clearing email..."
            onFilterClick={() => setIsFilterOpen(true)}
            filterButtonActive={activeFiltersCount > 0}
            onEdit={isAdmin ? handleEdit : undefined}
            onDelete={isAdmin ? (item) => {
               if(confirm(`Revoke all administrative access for ${item.name}?`)) {
                  deleteStaff(item.id);
                  showToast('success', 'Security principal de-registered');
               }
            } : undefined}
          />
          
          <AdvancedFilterModal 
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            title="Audit Security Protocols"
            config={filterConfig}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
            onApply={applyFilters}
          />
        </div>
      )}

      {/* ── Tab: Roles & Permissions Matrix ───────────────── */}
      {activeTab === 'roles' && (
        <div className="bg-surface/50 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden flex flex-col flex-1 min-h-0 shadow-2xl">
          <div className="p-10 border-b border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
            <h2 className="text-3xl font-display font-black text-white tracking-tight mb-2">Policy Permission Architecture</h2>
            <p className="text-sm text-gray-500 font-medium">Cross-functional capability matrix governing all architectural modules.</p>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-white/5 bg-white/[0.01]">
            {SYSTEM_ROLES.map(role => (
              <div key={role.id} className={cn("rounded-2xl border p-6 transition-all hover:scale-[1.02]", role.color)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-current shadow-lg">
                     <Shield className="w-5 h-5" />
                  </div>
                  <span className="font-black text-lg tracking-tight uppercase">{role.label}</span>
                </div>
                <p className="text-xs font-medium leading-relaxed opacity-70">{role.description}</p>
              </div>
            ))}
          </div>

          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/10 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">
                  <th className="px-10 py-6 sticky left-0 bg-surface z-10 border-b border-white/5">Architectural Module</th>
                  {SYSTEM_ROLES.map(role => (
                    <th key={role.id} className="px-6 py-6 text-center border-b border-white/5" colSpan={4}>
                      <span className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest", role.color)}>
                        {role.label}
                      </span>
                    </th>
                  ))}
                </tr>
                <tr className="bg-white/[0.01] text-gray-600 text-[9px] font-black uppercase tracking-widest">
                  <th className="px-10 py-3 sticky left-0 bg-surface z-10 border-b border-white/5 shrink-0 min-w-[200px]"></th>
                  {SYSTEM_ROLES.map(role => (
                    <React.Fragment key={role.id}>
                      <th className="px-3 py-3 text-center border-b border-white/5">Read</th>
                      <th className="px-3 py-3 text-center border-b border-white/5">Write</th>
                      <th className="px-3 py-3 text-center border-b border-white/5">Update</th>
                      <th className="px-3 py-3 text-center border-b border-white/5">Revoke</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MODULES.map(mod => (
                  <tr key={mod} className="group/permrow hover:bg-white/[0.03] transition-all">
                    <td className="px-10 py-5 sticky left-0 bg-surface z-10 capitalize font-bold text-white group-hover/permrow:text-primary transition-colors border-r border-white/5">{mod}</td>
                    {SYSTEM_ROLES.map(role => {
                      const perms = PERMISSION_MATRIX[role.id]?.[mod];
                      return (
                        <React.Fragment key={role.id}>
                          {['view', 'add', 'edit', 'delete'].map(action => (
                            <td key={action} className="px-3 py-5 text-center transition-colors">
                              {perms?.[action as keyof typeof perms] ? (
                                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center mx-auto border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                   <Check className="w-3 h-3 text-green-400" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/5 opacity-30">
                                   <X className="w-3 h-3 text-red-400" />
                                </div>
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
      <Modal isOpen={isInviteOpen} onClose={() => { setIsInviteOpen(false); setSelectedUser(null); setInviteEmailSearch(''); }} title="Promote System Principal">
        <form onSubmit={handleInviteSubmit} className="space-y-8 py-4">
          {!selectedUser ? (
             <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-primary/5 border border-primary/20 rounded-2xl text-xs text-primary font-medium leading-relaxed">
                  <UserPlus className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <p>Identify an existing system user to assign administrative logic. Promotion provides high-level clearance and triggers a secure notification broadcast.</p>
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 ml-1">Identity Lookup</label>
                  <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary transition-colors" />
                    <input 
                      required 
                      type="text" 
                      value={inviteEmailSearch}
                      onChange={e => setInviteEmailSearch(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder-gray-700" 
                      placeholder="Search by legal name or verified email..." 
                      autoFocus
                    />
                  </div>
                  
                  <AnimatePresence>
                  {inviteEmailSearch.trim() !== '' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute z-20 w-full mt-3 bg-surface border border-white/10 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl"
                    >
                      {searchResults.length > 0 ? (
                        searchResults.map(u => (
                          <button 
                            key={u.id}
                            type="button"
                            onClick={() => { setSelectedUser(u); setInviteEmailSearch(''); }}
                            className="w-full text-left px-6 py-5 hover:bg-white/5 flex items-center justify-between transition-all border-b border-white/5 last:border-0 group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                                 <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-black text-white group-hover:text-primary transition-colors tracking-tight">{u.name}</p>
                                <p className="text-xs text-gray-500 font-medium font-mono">{u.email}</p>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                               <ArrowRight className="w-5 h-5 text-primary" />
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-12 text-center bg-white/[0.01]">
                           <Search className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                           <p className="text-sm font-black text-gray-600 uppercase tracking-widest">No matching principals found</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
             </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
               <div className="relative p-8 rounded-[32px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 overflow-hidden shadow-2xl">
                 <div className="relative z-10 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                     <div className="relative">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.name}`} className="w-20 h-20 rounded-3xl border-2 border-primary/50 shadow-2xl shadow-primary/30" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-lg border-4 border-[#0F0F12] flex items-center justify-center">
                           <Check className="w-3 h-3 text-white font-black" />
                        </div>
                     </div>
                     <div>
                       <p className="font-black text-3xl text-white tracking-tighter uppercase">{selectedUser.name}</p>
                       <p className="text-sm text-primary/80 font-black tracking-widest">{selectedUser.email}</p>
                       <p className="text-[10px] text-gray-600 font-medium uppercase mt-2 tracking-[0.2em]">Verified Principal Node</p>
                     </div>
                   </div>
                   <button 
                     type="button" 
                     onClick={() => setSelectedUser(null)}
                     className="w-12 h-12 bg-black/20 hover:bg-red-500/20 text-gray-600 hover:text-red-400 rounded-2xl transition-all flex items-center justify-center active:scale-90"
                   >
                     <X className="w-6 h-6" />
                   </button>
                 </div>
                 {/* Decorative background element */}
                 <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-[100px]" />
               </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Privilege Tier Selection</label>
                <div className="grid grid-cols-1 gap-4">
                  {SYSTEM_ROLES.map(r => (
                    <label 
                      key={r.id} 
                      className={cn(
                        "relative flex items-start gap-5 p-6 rounded-3xl border-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group",
                        r.id === 'manager' ? 'border-primary/40 bg-primary/10 shadow-xl shadow-primary/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                      )}
                    >
                      <div className="mt-1">
                        <input 
                          type="radio" 
                          name="role" 
                          value={r.id} 
                          defaultChecked={r.id === 'staff'} 
                          className="w-5 h-5 accent-primary appearance-none border-2 border-white/20 rounded-full checked:bg-primary checked:border-primary transition-all cursor-pointer" 
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="font-black text-white text-lg tracking-tight uppercase group-hover:text-primary transition-colors">{r.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm">{r.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-white/5">
            <button type="button" onClick={() => { setIsInviteOpen(false); setSelectedUser(null); setInviteEmailSearch(''); }} className="flex-1 py-4 hover:bg-white/5 text-gray-500 hover:text-white rounded-2xl transition-all text-xs font-black uppercase tracking-widest">Abort Process</button>
            <button 
              type="submit" 
              disabled={!selectedUser} 
              className="flex-[2] py-4 bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/5 disabled:opacity-20 rounded-2xl transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95"
            >
              Initialize Clearance <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Staff Modal ────────────────────────── */}
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditingStaff(null); }} title="Modify Clearance Profile">
        <form onSubmit={handleEditSubmit} className="space-y-8 py-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Principal Name</label>
              <input name="name" required type="text" defaultValue={editingStaff?.name} className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-primary/50 focus:outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Verification Email</label>
              <input name="email" required type="email" defaultValue={editingStaff?.email} className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-primary/50 focus:outline-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Privilege Tier</label>
                <select name="role" required defaultValue={editingStaff?.role} className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-primary/50 focus:outline-none transition-all appearance-none uppercase tracking-widest">
                  {SYSTEM_ROLES.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Current Protocol Status</label>
                <select name="status" required defaultValue={editingStaff?.status} className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-primary/50 focus:outline-none transition-all appearance-none uppercase tracking-widest">
                  <option value="active">Active Integrity</option>
                  <option value="inactive">Suspended</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex gap-4">
            <button type="button" onClick={() => { setIsEditOpen(false); setEditingStaff(null); }} className="flex-1 py-4 hover:bg-white/5 text-gray-500 hover:text-white rounded-2xl transition-all text-xs font-black uppercase tracking-widest">Cancel</button>
            <button type="submit" className="flex-[2] py-4 bg-white text-black hover:bg-white/90 rounded-2xl transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-white/5">Finalize Changes</button>
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
            className={cn(
              "fixed bottom-10 right-10 z-[100] flex items-center gap-4 px-8 py-5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border backdrop-blur-2xl",
              toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            )}
          >
             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", toast.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30')}>
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-60">System Notification</p>
                <p className="font-bold text-sm tracking-tight">{toast.message}</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Minimal CheckCircle icon if not in lucide scope
function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}

// Minimal AlertCircle icon
function AlertCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  );
}
