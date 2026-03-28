import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Seat, Showtime, Cinema, Movie } from '@/data/mock';

interface BookingSummaryProps {
  step: number;
  movie: Movie;
  selectedCinema: string | null;
  cinemas: Cinema[];
  selectedDate: Date;
  selectedShowtime: Showtime | null;
  selectedSeats: Seat[];
  totalPrice: number;
  onNextStep: () => void;
  onConfirm: () => void;
  confirming: boolean;
}

export function BookingSummary({
  step,
  movie,
  selectedCinema,
  cinemas,
  selectedDate,
  selectedShowtime,
  selectedSeats,
  totalPrice,
  onNextStep,
  onConfirm,
  confirming
}: BookingSummaryProps) {
  const cinema = cinemas.find(c => c.id === selectedCinema);

  return (
    <div className="bg-surface rounded-xl p-6 border border-white/5 sticky top-24 shadow-xl">
      <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-4 text-white">Booking Summary</h3>
      <div className="flex gap-4 mb-6">
        <div className="w-16 h-24 bg-white/5 rounded-md overflow-hidden flex-shrink-0 animate-pulse">
           {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />}
        </div>
        <div>
          <h4 className="font-bold text-white leading-tight mb-1">{movie.title}</h4>
          <p className="text-xs text-gray-400">{movie.duration} min • {movie.rating}</p>
        </div>
      </div>
      <div className="space-y-4 text-sm mb-6 pb-6 border-b border-white/10">
        <div className="flex justify-between">
          <span className="text-gray-400">Cinema</span>
          <span className="font-medium text-white text-right max-w-[150px] truncate">{cinema?.name || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Date</span>
          <span className="font-medium text-white">{format(selectedDate, 'dd MMM yyyy')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Time</span>
          <span className="font-medium text-white">{selectedShowtime ? selectedShowtime.time : '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Seats</span>
          <span className="font-bold text-primary">{selectedSeats.length > 0 ? selectedSeats.map(s => s.id).join(', ') : '-'}</span>
        </div>
      </div>
      <div className="flex justify-between items-end mb-6">
        <span className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Total Price</span>
        <span className="text-2xl font-display font-black text-white">${totalPrice.toFixed(2)}</span>
      </div>

      {step === 1 && (
        <button 
          disabled={!selectedShowtime} 
          onClick={onNextStep} 
          className="w-full py-4 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          Select Seats <ChevronRight className="w-5 h-5" />
        </button>
      )}
      {step === 2 && (
        <button 
          disabled={selectedSeats.length === 0} 
          onClick={onNextStep} 
          className="w-full py-4 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          Continue to Payment <ChevronRight className="w-5 h-5" />
        </button>
      )}
      {step === 3 && (
        <button 
          onClick={onConfirm} 
          disabled={confirming} 
          className="w-full py-4 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/40"
        >
          {confirming ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : `Confirm & Pay $${totalPrice.toFixed(2)}`}
        </button>
      )}
    </div>
  );
}
