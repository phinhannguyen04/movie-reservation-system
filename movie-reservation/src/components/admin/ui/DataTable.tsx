import React, { ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (item: T) => ReactNode;
  className?: string; // Optional custom styling for the column
}

interface DataTableProps<T> {
  title?: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  onAdd?: () => void;
  addLabel?: string;
  searchPlaceholder?: string;
  customFilters?: ReactNode;
  filterButtonActive?: boolean;
  onFilterClick?: () => void;
  itemsPerPage?: number;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  defaultSort?: { key: keyof T; direction: 'asc' | 'desc' };
  isLoading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  title,
  description,
  data,
  columns,
  onAdd,
  addLabel = 'Add New',
  searchPlaceholder = 'Search records...',
  customFilters,
  filterButtonActive,
  onFilterClick,
  itemsPerPage = 10,
  onEdit,
  onDelete,
  defaultSort,
  isLoading = false
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(defaultSort || null);

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const searchedData = React.useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(item => {
      const values = Object.values(item).filter(v => typeof v === 'string' || typeof v === 'number');
      return values.some(val => String(val).toLowerCase().includes(lowerQuery));
    });
  }, [data, searchQuery]);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return searchedData;
    
    return [...searchedData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchedData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, data.length]);

  return (
    <div className="bg-surface/40 backdrop-blur-xl rounded-[32px] border border-white/10 flex flex-col h-full shadow-[0_40px_100px_rgba(0,0,0,0.5)] group/table transition-all duration-700 overflow-hidden">
      {/* Table Header */}
      <div className="px-8 py-10 border-b border-white/5 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="space-y-2">
            {title && <h2 className="text-3xl font-display font-black text-white tracking-tighter uppercase leading-none">{title}</h2>}
            {description && <p className="text-sm text-gray-500 font-medium max-w-xl">{description}</p>}
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Bar - High Fidelity */}
            <div className="relative group/search flex-1 min-w-[320px]">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-focus-within/search:bg-primary/20 transition-all opacity-0 group-focus-within/search:opacity-100" />
              <Search className="w-5 h-5 text-gray-500 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within/search:text-primary transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="relative w-full pl-14 pr-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-sm font-bold text-white placeholder-gray-700 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            {/* Actions & Filters */}
            <div className="flex items-center gap-3">
              {onFilterClick && (
                <button 
                  onClick={onFilterClick}
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95",
                    filterButtonActive 
                      ? "bg-primary text-white border-primary shadow-[0_10px_40px_rgba(255,51,0,0.3)]" 
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              )}
              
              {customFilters && <div className="contents">{customFilters}</div>}
              
              <div className="h-10 w-[1px] bg-white/10 mx-2 hidden sm:block" />

              {onAdd && (
                <button 
                  onClick={onAdd}
                  className="px-8 py-4 bg-white text-black hover:bg-white/90 text-[10px] font-black rounded-2xl transition-all shadow-2xl shadow-white/5 active:scale-95 whitespace-nowrap uppercase tracking-[0.2em]"
                >
                  {addLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Table Content */}
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
          <thead>
            <tr className="bg-white/[0.02] text-gray-500 font-black text-[11px] uppercase tracking-[0.2em]">
              {columns.map((col, idx) => {
                const isSorted = sortConfig?.key === col.accessor;
                return (
                  <th 
                    key={idx} 
                    className={cn(
                      "px-6 py-4 border-b border-white/5 cursor-pointer hover:text-white transition-colors group/header",
                      col.className
                    )}
                    onClick={() => handleSort(col.accessor)}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {isSorted ? (
                        <span className="text-primary font-bold">
                          {sortConfig?.direction === 'asc' ? '↓' : '↑'}
                        </span>
                      ) : (
                        <span className="opacity-0 group-hover/header:opacity-30 transition-opacity">↓</span>
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="px-6 py-4 border-b border-white/5 text-right">Action Control</th>
            </tr>
          </thead>
          <tbody className="relative">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-20 text-center">
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-sm font-medium text-gray-500">Synchronizing data...</p>
                   </div>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, rowIdx) => (
                <tr 
                  key={item.id} 
                  className="group/row transition-all hover:bg-white/[0.03]"
                >
                  {columns.map((col, idx) => (
                    <td 
                      key={idx} 
                      className={cn(
                         "px-6 py-5 border-b border-white/[0.03] transition-colors",
                         col.className
                      )}
                    >
                      {col.render ? col.render(item) : (
                        <span className="text-gray-300 font-medium">
                          {String(item[col.accessor] ?? '—')}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-5 border-b border-white/[0.03] text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(item)} 
                          className="p-2 text-gray-400 hover:text-white rounded-xl transition-all hover:bg-white/10 active:scale-90" 
                          title="Edit Record"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(item)} 
                          className="p-2 text-gray-400 hover:text-red-400 rounded-xl transition-all hover:bg-red-400/10 active:scale-90" 
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                        <Search className="w-6 h-6" />
                     </div>
                     <p className="font-bold text-gray-500">No matching records found</p>
                     <p className="text-xs text-gray-600">Try adjusting your filters or search terms</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && sortedData.length > 0 && (
        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
          <p className="flex items-center gap-2">
            Showing <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> 
            to <span className="text-white">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> 
            of <span className="text-white">{sortedData.length}</span> entries
          </p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="group flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-20 transition-all font-black"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Previous
            </button>
            
            <div className="flex items-center gap-1">
               {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                 // Simple pagination logic for 5 pages
                 let pageNum = currentPage;
                 if (totalPages <= 5) pageNum = i + 1;
                 else if (currentPage <= 3) pageNum = i + 1;
                 else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                 else pageNum = currentPage - 2 + i;

                 return (
                   <button 
                     key={i}
                     onClick={() => setCurrentPage(pageNum)}
                     className={cn(
                       "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                       currentPage === pageNum 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                     )}
                   >
                     {pageNum}
                   </button>
                 );
               })}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="group flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-20 transition-all font-black" 
            >
              Next
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
