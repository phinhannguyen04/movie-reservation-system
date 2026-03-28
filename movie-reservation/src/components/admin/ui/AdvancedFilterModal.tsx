import React from 'react';
import { X, ArrowUpDown, RotateCcw, Check } from 'lucide-react';
import { Modal } from './Modal';
import { SearchableSelect } from './SearchableSelect';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
}

export interface SortOption {
  id: string;
  label: string;
  sub?: string;
}

export interface FilterConfig {
  selects?: {
    id: string;
    label: string;
    options: FilterOption[];
    allLabel?: string;
    placeholder?: string;
  }[];
  dates?: {
    id: string;
    label: string;
  }[];
  sortOptions?: SortOption[];
}

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  config: FilterConfig;
  filters: Record<string, any>;
  onFilterChange: (id: string, value: any) => void;
  onReset: () => void;
  onApply: () => void;
}

export function AdvancedFilterModal({
  isOpen,
  onClose,
  title = "Filter & Sort Data",
  config,
  filters,
  onFilterChange,
  onReset,
  onApply
}: AdvancedFilterModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-8 py-4">
        {/* Dynamic Select Filters */}
        {config.selects && config.selects.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
               Category Selections
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {config.selects.map(sel => (
                 <div key={sel.id} className="space-y-2">
                   <label className="text-xs font-bold text-gray-400">{sel.label}</label>
                   <SearchableSelect 
                     options={sel.options} 
                     value={filters[sel.id] || 'all'} 
                     onChange={(val) => onFilterChange(sel.id, val)}
                     allLabel={sel.allLabel}
                     placeholder={sel.placeholder}
                     className="w-full"
                   />
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Date Filters */}
        {config.dates && config.dates.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
               Temporal Constraints
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {config.dates.map(date => (
                 <div key={date.id} className="space-y-2">
                   <label className="text-xs font-bold text-gray-400">{date.label}</label>
                   <div className="relative group">
                     <input 
                       type="date" 
                       value={filters[date.id] || ''} 
                       onChange={(e) => onFilterChange(date.id, e.target.value)} 
                       className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all" 
                     />
                     {filters[date.id] && (
                       <button 
                         onClick={() => onFilterChange(date.id, "")} 
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     )}
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Sorting Section */}
        {config.sortOptions && config.sortOptions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
               <ArrowUpDown className="w-3 h-3 text-primary" /> Ordering Logic
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
               {config.sortOptions.map(opt => {
                 const isActive = filters.sortOption === opt.id;
                 return (
                   <button 
                     key={opt.id} 
                     onClick={() => onFilterChange('sortOption', opt.id)}
                     className={cn(
                       "p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group/sort",
                       isActive 
                        ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5" 
                        : "bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10"
                     )}
                   >
                     {isActive && <div className="absolute top-2 right-2 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center animate-in zoom-in duration-300"><Check className="w-2.5 h-2.5" /></div>}
                     <p className="text-sm font-bold tracking-tight">{opt.label}</p>
                     {opt.sub && <p className="text-[10px] opacity-50 mt-1 font-medium">{opt.sub}</p>}
                   </button>
                 );
               })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => { onApply(); onClose(); }} 
            className="flex-3 py-4 bg-white text-black hover:bg-white/90 font-black text-sm rounded-2xl transition-all shadow-xl shadow-white/5 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            Apply Transformations
          </button>
          <button 
            onClick={onReset} 
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-sm rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>
    </Modal>
  );
}
