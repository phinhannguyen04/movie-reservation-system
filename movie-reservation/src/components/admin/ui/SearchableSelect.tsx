import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allLabel?: string;
  className?: string;
  name?: string;
  showAll?: boolean;
  required?: boolean;
  maxDisplay?: number; // max options to render at once (default 20)
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  allLabel = 'All',
  className = '',
  name,
  showAll = true,
  required = false,
  maxDisplay = 20,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  const displayedOptions = filteredOptions.slice(0, maxDisplay);
  const hasMore = filteredOptions.length > maxDisplay;

  const selectedLabel = value === 'all'
    ? allLabel
    : options.find(o => o.value === value)?.label || value;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 bg-background border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary px-3 py-2 w-full min-w-[160px] ${!value || value === 'all' ? 'text-gray-500' : ''}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-surface border border-white/10 rounded-lg shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-1.5 bg-background border border-white/10 rounded-md text-xs text-white focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {showAll && (
              <button
                type="button"
                onClick={() => { onChange('all'); setIsOpen(false); setSearch(''); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors ${value === 'all' ? 'text-primary font-medium' : 'text-gray-300'}`}
              >
                {allLabel}
              </button>
            )}
            {displayedOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(''); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors ${value === opt.value ? 'text-primary font-medium' : 'text-gray-300'}`}
              >
                {opt.label}
              </button>
            ))}
            {hasMore && (
              <p className="px-3 py-2 text-xs text-gray-500 border-t border-white/5">
                Showing {maxDisplay} of {filteredOptions.length} — type to narrow down
              </p>
            )}
            {filteredOptions.length === 0 && (
              <p className="px-3 py-2 text-xs text-gray-500">No results found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
