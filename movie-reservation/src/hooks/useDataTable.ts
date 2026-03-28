import { useState, useMemo, useCallback } from 'react';

export interface UseDataTableOptions<T> {
  initialData: T[];
  filterLogic: (item: T, filters: Record<string, any>) => boolean;
  sortLogic: (itemA: T, itemB: T, sortOption: string) => number;
  initialFilters?: Record<string, any>;
}

export function useDataTable<T>({
  initialData,
  filterLogic,
  sortLogic,
  initialFilters = { sortOption: 'newest' }
}: UseDataTableOptions<T>) {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>(initialFilters);

  const handleFilterChange = useCallback((id: string, value: any) => {
    setFilters(prev => ({ ...prev, [id]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }, [initialFilters]);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const processedData = useMemo(() => {
    const filtered = initialData.filter(item => filterLogic(item, appliedFilters));
    return [...filtered].sort((a, b) => sortLogic(a, b, appliedFilters.sortOption));
  }, [initialData, filterLogic, sortLogic, appliedFilters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (key === 'sortOption') {
        if (value !== initialFilters.sortOption) count++;
      } else if (value && value !== 'all' && value !== '') {
        count++;
      }
    });
    return count;
  }, [appliedFilters, initialFilters.sortOption]);

  return {
    filters,
    appliedFilters,
    handleFilterChange,
    resetFilters,
    applyFilters,
    processedData,
    activeFiltersCount,
    setFilters // For direct manual override if needed
  };
}
