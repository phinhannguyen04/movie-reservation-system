import React, { useState } from 'react';
import { Settings, Bookmark, CheckCircle, AlertCircle, Info, X, Shield, Globe, HardDrive } from 'lucide-react';
import { AdminHeader } from '@/components/admin/ui/AdminHeader';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

type TabId = 'general' | 'booking' | 'security';

const tabs = [
  { id: 'general', label: 'Core Infrastructure', icon: Globe, sub: 'System identity & nodes' },
  { id: 'booking', label: 'Reservation Logic', icon: Bookmark, sub: 'Rules & timeouts' },
  { id: 'security', label: 'Access Policy', icon: Shield, sub: 'Auth & registration' },
] as const;

type ToastType = 'success' | 'error' | 'info';
interface Toast { type: ToastType; message: string }

function InlineToast({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const styles = {
    success: { bg: 'bg-green-500/10 border-green-500/20 text-green-400 shadow-green-500/5', Icon: CheckCircle },
    error:   { bg: 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-500/5',       Icon: AlertCircle },
    info:    { bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-500/5',    Icon: Info },
  };
  const { bg, Icon } = styles[toast.type];
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-start gap-4 p-5 rounded-2xl border text-sm mb-6 shadow-xl backdrop-blur-xl', bg)}
    >
      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
         <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 pt-1">
         <p className="font-bold tracking-tight">{toast.message}</p>
      </div>
      <button onClick={onDismiss} className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-60 hover:opacity-100">
         <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const fieldClass = "w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-gray-700";
  const labelClass = "block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1";

  return (
    <div className="max-w-7xl mx-auto space-y-12 h-full pb-20 pt-4">
      <AdminHeader 
        title="System Configuration"
        description="Fine-tune high-level variables, security logic, and architectural parameters for the entire network."
        category="Global Protocol"
        icon={Settings}
        actions={
          <div className="flex items-center gap-4 bg-surface/40 backdrop-blur-md p-4 rounded-3xl border border-white/5 shadow-2xl">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <HardDrive className="w-6 h-6 text-gray-500" />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Database Load</p>
                <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div className="w-[12%] h-full bg-primary shadow-[0_0_10px_rgba(255,51,0,0.5)]"></div>
                </div>
             </div>
          </div>
        }
      />

      <div className="flex flex-col xl:flex-row gap-12">
        <div className="w-full xl:w-80 shrink-0 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full group relative flex items-center gap-5 px-6 py-5 rounded-[24px] transition-all text-left border-2",
                  isActive 
                    ? "bg-primary text-white border-primary shadow-2xl shadow-primary/20" 
                    : "bg-surface/30 border-white/5 text-gray-500 hover:text-white hover:border-white/10"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  isActive ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
                )}>
                  <Icon className={cn("w-6 h-6", isActive ? "text-white" : "text-gray-500 group-hover:text-primary")} />
                </div>
                <div>
                   <p className="font-black text-sm uppercase tracking-widest">{tab.label}</p>
                   <p className={cn("text-[10px] font-medium opacity-60", isActive ? "text-white" : "text-gray-600")}>{tab.sub}</p>
                </div>
                {isActive && (
                   <motion.div layoutId="tab-indicator" className="absolute right-6 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 bg-surface/50 backdrop-blur-xl rounded-[40px] border border-white/5 p-10 xl:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="border-l-4 border-primary pl-6 py-2">
                   <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase">Infrastructure Core</h2>
                   <p className="text-gray-500 text-sm font-medium">Root identification and node metadata.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className={labelClass}>Production System Label</label>
                    <input type="text" defaultValue="CINEMAX PROTOCOL" className={fieldClass} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Emergency Support Gateway</label>
                    <input type="email" defaultValue="nexus@cinemax.example.com" className={fieldClass} />
                  </div>
                </div>

                <div className="pt-8 flex justify-end">
                  <button onClick={() => showToast('success', 'Registry synchronized')} className="px-10 py-4 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95">
                    Sync Registry
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'booking' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="border-l-4 border-primary pl-6 py-2">
                   <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase">Reservation Logic</h2>
                   <p className="text-gray-500 text-sm font-medium">Constraints governing the transaction lifecycle.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className={labelClass}>Max Inventory Per Session</label>
                    <input type="number" defaultValue="8" className={fieldClass} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Logical Lock Timeout (Sec)</label>
                    <input type="number" defaultValue="600" className={fieldClass} />
                  </div>
                </div>

                <div className="pt-8 flex justify-end">
                  <button onClick={() => showToast('success', 'Logic rewritten')} className="px-10 py-4 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95">
                    Rewrite Logic
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="border-l-4 border-primary pl-6 py-2">
                   <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase">Access Policy</h2>
                   <p className="text-gray-500 text-sm font-medium">Authentication shielding and security protocols.</p>
                </div>

                <div className="space-y-5">
                  {[
                    { title: 'Public Onboarding', desc: 'Permit new identities to register within the network', active: true },
                    { title: 'Audit Logging', desc: 'Secure immutable log of all architectural mutations', active: true },
                  ].map((policy, idx) => (
                    <div key={idx} className="flex items-center justify-between p-8 bg-black/20 border border-white/5 rounded-3xl group hover:border-white/10 transition-all">
                      <div>
                        <h3 className="font-black text-lg text-white mb-1 uppercase tracking-tight">{policy.title}</h3>
                        <p className="text-xs text-gray-500 font-medium">{policy.desc}</p>
                      </div>
                      <div className={cn(
                        "w-12 h-6 rounded-full relative transition-all",
                        policy.active ? "bg-primary" : "bg-white/10"
                      )}>
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          policy.active ? "right-1" : "left-1"
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      {toast && <InlineToast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
