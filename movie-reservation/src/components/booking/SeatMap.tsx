import React from 'react';
import { cn } from '@/lib/utils';
import { Seat } from '@/data/mock';

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: Seat[];
  bookedSeats: Set<string>;
  onSeatClick: (seat: Seat) => void;
}

export function SeatMap({ seats, selectedSeats, bookedSeats, onSeatClick }: SeatMapProps) {
  const rows = ['A','B','C','D','E','F','G','H','I','J'];

  return (
    <div className="bg-surface rounded-xl p-6 border border-white/5 overflow-hidden">
      <div className="mb-12 relative">
        <div className="h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 blur-[2px] rounded-full" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-gradient-to-b from-white/10 to-transparent blur-xl" />
        <p className="text-center text-xs text-gray-500 mt-4 uppercase tracking-widest font-medium">Screen</p>
      </div>
      <div className="overflow-x-auto pb-8 hide-scrollbar">
        <div className="min-w-[600px] flex flex-col gap-2 items-center">
          {rows.map(row => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-6 text-center text-xs font-bold text-gray-500">{row}</span>
              <div className="flex gap-2">
                {seats.filter(s => s.row === row).map(seat => {
                  const isOccupied = seat.status === 'occupied' || bookedSeats.has(seat.id);
                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  let seatClass = "w-8 h-8 rounded-t-lg rounded-b-sm transition-all duration-200 flex items-center justify-center text-[10px] font-medium";
                  
                  if (isOccupied) seatClass = cn(seatClass, "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50");
                  else if (isSelected) seatClass = cn(seatClass, "bg-primary text-white shadow-[0_0_10px_rgba(229,9,20,0.5)] scale-110 ring-2 ring-primary/20");
                  else if (seat.type === 'vip') seatClass = cn(seatClass, "bg-background border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20 cursor-pointer");
                  else if (seat.type === 'couple') seatClass = cn(seatClass, "bg-background border border-pink-500/50 text-pink-500 hover:bg-pink-500/20 cursor-pointer w-[72px]");
                  else seatClass = cn(seatClass, "bg-background border border-white/10 text-gray-400 hover:bg-white/10 cursor-pointer");
                  
                  return (
                    <button 
                      key={seat.id} 
                      disabled={isOccupied} 
                      onClick={() => onSeatClick(seat)} 
                      className={seatClass}
                    >
                      {isSelected || isOccupied ? seat.id : ''}
                    </button>
                  );
                })}
              </div>
              <span className="w-6 text-center text-xs font-bold text-gray-500">{row}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-background border border-white/10" /><span className="text-xs text-gray-400">Available</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-primary" /><span className="text-xs text-gray-400">Selected</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-gray-800 opacity-50" /><span className="text-xs text-gray-400">Occupied</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-background border border-yellow-500/50" /><span className="text-xs text-gray-400">VIP ($15)</span></div>
        <div className="flex items-center gap-2"><div className="w-11 h-5 rounded-t bg-background border border-pink-500/50" /><span className="text-xs text-gray-400">Couple ($25)</span></div>
      </div>
    </div>
  );
}
