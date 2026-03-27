import React, { ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (item: T) => ReactNode;
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
  itemsPerPage?: number;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  title,
  description,
  data,
  columns,
  onAdd,
  addLabel = 'Add New',
  searchPlaceholder = 'Search...',
  customFilters,
  itemsPerPage = 10,
  onEdit,
  onDelete
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);

  // Apply search filtering across all property values
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(item => {
      // Check if any accessible string/number value in the object matches the search query
      return Object.values(item).some(val => 
        val && String(val).toLowerCase().includes(lowerQuery)
      );
    });
  }, [data, searchQuery]);

  // Apply pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset to page 1 if search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  return (
    <div className="bg-surface rounded-xl border border-white/5 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {title && <h2 className="text-lg font-bold text-white mb-1">{title}</h2>}
          {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {customFilters && (
            <div className="flex items-center gap-3 mr-2">
              {customFilters}
            </div>
          )}
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-4 py-2 bg-background border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary w-full sm:w-64"
            />
          </div>
          {onAdd && (
            <button 
              onClick={onAdd}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              {addLabel}
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-gray-400 font-medium">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4">{col.header}</th>
              ))}
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className="px-6 py-4">
                      {col.render ? col.render(item) : String(item[col.accessor])}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-400 rounded transition-colors bg-white/5 hover:bg-blue-400/10" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item)} className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors bg-white/5 hover:bg-red-400/10" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {!onEdit && !onDelete && (
                        <button className="p-1 text-gray-400 hover:text-white rounded transition-colors" title="Options">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-gray-400">
          <p>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 hover:text-white disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-2 font-medium text-white">{currentPage} / {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 hover:text-white disabled:opacity-50 transition-colors" 
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
