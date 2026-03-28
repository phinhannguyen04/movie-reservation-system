import React from 'react';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  dates: Date[];
  selectedDate: Date;
  onSelect: (date: Date) => void;
  className?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ dates, selectedDate, onSelect, className }) => {
  return (
    <div className={cn("flex overflow-x-auto pb-4 gap-3 scrollbar-hide", className)}>
      {dates.map((date, index) => {
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = date.getDate();
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });

        return (
          <button
            key={date.toISOString()}
            onClick={() => onSelect(date)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[80px] p-4 rounded-2xl border transition-all shrink-0 active:scale-95",
              isSelected 
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                : "bg-surface border-white/10 text-gray-500 hover:bg-white/5 hover:text-white"
            )}
          >
            <span className="text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60">{dayName}</span>
            <span className="text-2xl font-black leading-none mb-1">{dayNumber}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{monthName}</span>
          </button>
        );
      })}
    </div>
  );
}
