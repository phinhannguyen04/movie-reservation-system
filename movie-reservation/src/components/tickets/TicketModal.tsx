import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, MapPin, Calendar, Clock, Ticket as TicketIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Movie, Cinema, Booking } from '@/data/mock';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  movie: Movie | null;
  cinema: Cinema | null;
}

export function TicketModal({ isOpen, onClose, booking, movie, cinema }: TicketModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !booking || !movie || !cinema) return null;

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#141414', // Match surface color
        scale: 2, // Higher quality
        useCORS: true, // Allow external images
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `ticket-${booking.id}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to download ticket:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md flex flex-col gap-4"
          >
            {/* Close Button */}
            <div className="flex justify-end">
              <button 
                onClick={onClose}
                className="p-2 bg-surface/50 hover:bg-surface rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Ticket Content to Capture */}
            <div 
              ref={ticketRef}
              className="bg-surface rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative"
            >
              {/* Movie Backdrop Header */}
              <div className="relative h-48">
                <img 
                  src={movie.backdropUrl} 
                  alt={movie.title} 
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                  <TicketIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold tracking-wider uppercase text-white">Digital Ticket</span>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="p-6 relative">
                {/* Perforated Edge Effect */}
                <div className="absolute left-0 right-0 top-0 h-0 border-t-2 border-dashed border-white/10" />
                <div className="absolute -left-3 -top-3 w-6 h-6 bg-black rounded-full" />
                <div className="absolute -right-3 -top-3 w-6 h-6 bg-black rounded-full" />

                <h2 className="text-2xl font-display font-bold text-white mb-2">{movie.title}</h2>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{cinema.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date
                    </p>
                    <p className="font-medium text-white">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Time
                    </p>
                    <p className="font-medium text-white">19:30</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Seats</p>
                    <p className="font-bold text-primary text-lg">{booking.seats.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Screen</p>
                    <p className="font-medium text-white">Screen 3</p>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booking ID</p>
                    <p className="font-mono text-sm text-white tracking-widest">{booking.id}</p>
                    <p className="text-xs text-gray-500 mt-4">Total Paid: <span className="text-white font-medium">${booking.totalPrice}</span></p>
                  </div>
                  <div className="bg-white p-2 rounded-xl">
                    <QRCodeSVG value={booking.id} size={80} />
                  </div>
                </div>
              </div>
            </div>

            {/* Download Action */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Ticket...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Ticket
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
