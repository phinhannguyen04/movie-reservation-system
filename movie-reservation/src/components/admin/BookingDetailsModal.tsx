import React from 'react';
import { Film, MapPin, Eye, Clock, Calendar } from 'lucide-react';
import { Modal } from '@/components/admin/ui/Modal';
import { Booking } from '@/data/mock';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export function BookingDetailsModal({ isOpen, onClose, booking }: BookingDetailsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
    >
      <div className="min-h-[100px]">
        {booking ? (
          <div className="space-y-8">
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="w-16 h-20 bg-primary/20 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-primary/30">
                <Film className="w-8 h-8 text-primary/40" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-white truncate">{booking.movieTitle}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold border border-primary/20 uppercase">
                    {booking.status}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">ID: #{booking.id.substring(0, 12)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cinema Hall</p>
                <div className="flex items-center gap-2 text-sm text-gray-200 font-medium">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{booking.cinemaName}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Screen</p>
                <div className="flex items-center gap-2 text-sm text-gray-200 font-medium">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>{booking.screen || "Main Hall"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Showtime</p>
                <div className="flex items-center gap-2 text-sm text-gray-200 font-medium">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{booking.showtime || "Not set"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Booking Date</p>
                <div className="flex items-center gap-2 text-sm text-gray-200 font-medium">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-background/50 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Selected Seats</p>
                <span className="text-primary font-bold text-sm">{booking.seats.length} Tickets</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {booking.seats.map(seat => (
                  <span key={seat} className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-md shadow-lg shadow-primary/20">
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Customer</p>
                <p className="text-sm text-white font-bold">{booking.userName || "Guest User"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-xl font-display font-black text-primary">${(booking.totalPrice || 0).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all border border-white/10">
                Resend Confirmation
              </button>
              <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl transition-all border border-red-500/20">
                Cancel Ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-gray-500">No booking selected</div>
        )}
      </div>
    </Modal>
  );
}
