import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { movies, cinemas, generateShowtimes, generateSeats, type Showtime, type Seat } from '@/data/mock';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useMemo } from 'react';

type Step = 1 | 2 | 3 | 4;

export function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { refreshTickets, tickets } = useData();
  
  const movie = movies.find(m => m.id === id);

  const [step, setStep] = useState<Step>(1);
  
  const initialDateParam = searchParams.get('date');
  const initialCinemaParam = searchParams.get('cinema');
  const initialTimeParam = searchParams.get('time');

  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDateParam ? new Date(initialDateParam) : new Date()
  );
  const [selectedCinema, setSelectedCinema] = useState<string | null>(initialCinemaParam);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const dates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));
  const showtimes = generateShowtimes(movie?.id || '', format(selectedDate, 'yyyy-MM-dd'));

  const now = new Date();

  const bookedSeats = useMemo(() => {
    if (!selectedShowtime || !selectedDate || !selectedCinema) return new Set<string>();
    
    const relevantTickets = tickets.filter(t => 
       t.movieId === movie?.id &&
       t.cinemaId === selectedCinema &&
       t.status !== 'cancelled' &&
       format(new Date(t.bookingDate), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') &&
       (t.showtime === selectedShowtime.time || t.showtimeId === selectedShowtime.id)
    );
    
    const seatSet = new Set<string>();
    relevantTickets.forEach(t => t.seats?.forEach(s => seatSet.add(s.trim())));
    return seatSet;
  }, [tickets, movie?.id, selectedCinema, selectedDate, selectedShowtime]);

  // Auto-select showtime from URL params
  useEffect(() => {
    if (initialTimeParam && initialCinemaParam && showtimes.length > 0 && !selectedShowtime) {
      const foundShowtime = showtimes.find(
        s => s.time === initialTimeParam && s.cinemaId === initialCinemaParam
      );
      if (foundShowtime) {
        setSelectedShowtime(foundShowtime);
        setStep(2);
      }
    }
  }, [initialTimeParam, initialCinemaParam, showtimes, selectedShowtime]);

  useEffect(() => {
    if (step === 2 && seats.length === 0) {
      setSeats(generateSeats());
    }
  }, [step, seats.length]);

  if (!movie) {
    return <div className="p-12 text-center">Movie not found</div>;
  }

  const isShowtimePast = (showtime: Showtime): boolean => {
    const [hours, minutes] = showtime.time.split(':').map(Number);
    const showtimeDate = new Date(selectedDate);
    showtimeDate.setHours(hours, minutes, 0, 0);
    return showtimeDate < now;
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied' || bookedSeats.has(seat.id)) return;
    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      if (isSelected) return prev.filter(s => s.id !== seat.id);
      if (prev.length >= 8) return prev;
      return [...prev, seat];
    });
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handleConfirmBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingError('');
    setConfirming(true);

    try {
      const cinema = cinemas.find(c => c.id === selectedCinema);
      const payload = {
        movieId: movie.id,
        showtimeId: selectedShowtime?.id || '',
        cinemaId: selectedCinema || '',
        seats: selectedSeats.map(s => s.id),
        totalPrice,
        bookingDate: selectedDate.toISOString(),
        showtime: selectedShowtime?.time || '',
        cinemaName: cinema?.name || '',
        screen: selectedShowtime?.screen || '',
        movieTitle: movie.title,
        userId: user.id, // Ensure user id propagates to the backend
      };

      const result = await api.post<{ id: string; bookingId?: string }>(
        '/bookings',
        payload
      );
      
      // Refresh the tickets in global state so MyTickets page is up to date
      await refreshTickets();

      setBookingId(result.id || result.bookingId || `B-${Date.now()}`);
      setStep(4);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header / Progress */}
      <div className="mb-8">
        <button 
          onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        
        <div className="flex items-center justify-between max-w-3xl mx-auto relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-surface-light -z-10" />
          <div 
            className="absolute left-0 top-1/2 h-0.5 bg-primary -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
          {[
            { num: 1, label: 'Showtime' }, { num: 2, label: 'Seats' },
            { num: 3, label: 'Payment' }, { num: 4, label: 'Ticket' }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2 bg-background px-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300",
                step >= s.num ? "bg-primary text-white" : "bg-surface-light text-gray-500",
                step === s.num && "ring-4 ring-primary/20"
              )}>
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className={cn("text-xs font-medium hidden sm:block", step >= s.num ? "text-white" : "text-gray-500")}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                {/* Date Selection */}
                <div>
                  <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />Select Date
                  </h2>
                  <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
                    {dates.map((date, i) => {
                      const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                      return (
                        <button
                          key={i}
                          onClick={() => { setSelectedDate(date); setSelectedShowtime(null); }}
                          className={cn(
                            "flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl border transition-all snap-start",
                            isSelected
                              ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]"
                              : "bg-surface border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                          )}
                        >
                          <span className="text-xs font-medium uppercase">{format(date, 'MMM')}</span>
                          <span className="text-2xl font-bold my-1">{format(date, 'dd')}</span>
                          <span className="text-xs">{format(date, 'EEE')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cinema & Showtime Selection */}
                <div>
                  <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />Select Cinema & Time
                  </h2>
                  <div className="space-y-6">
                    {cinemas.map(cinema => {
                      const cinemaShowtimes = showtimes.filter(s => s.cinemaId === cinema.id);
                      if (cinemaShowtimes.length === 0) return null;
                      return (
                        <div key={cinema.id} className="bg-surface rounded-xl p-5 border border-white/5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-white">{cinema.name}</h3>
                              <p className="text-sm text-gray-400">{cinema.address}</p>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded text-gray-300">{cinema.distance}</span>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {cinemaShowtimes.map(st => {
                              const isPast = isShowtimePast(st);
                              const isSelected = selectedShowtime?.id === st.id;
                              return (
                                <button
                                  key={st.id}
                                  disabled={isPast}
                                  onClick={() => { setSelectedCinema(cinema.id); setSelectedShowtime(st); }}
                                  title={isPast ? 'This showtime has already passed' : ''}
                                  className={cn(
                                    "px-4 py-2 rounded-lg border transition-all flex flex-col items-center",
                                    isPast
                                      ? "opacity-40 cursor-not-allowed border-white/5 bg-white/5 text-gray-600"
                                      : isSelected
                                        ? "bg-primary/10 border-primary text-primary"
                                        : "bg-background border-white/10 text-gray-300 hover:border-white/30"
                                  )}
                                >
                                  <span className="text-lg font-bold">{st.time}</span>
                                  <span className="text-[10px] uppercase tracking-wider opacity-80">{st.format} • {st.screen}</span>
                                  {isPast && <span className="text-[10px] text-red-500/70 mt-0.5">Passed</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <div className="bg-surface rounded-xl p-6 border border-white/5 overflow-hidden">
                  <div className="mb-12 relative">
                    <div className="h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 blur-[2px] rounded-full" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-gradient-to-b from-white/10 to-transparent blur-xl" />
                    <p className="text-center text-xs text-gray-500 mt-4 uppercase tracking-widest font-medium">Screen</p>
                  </div>
                  <div className="overflow-x-auto pb-8 hide-scrollbar">
                    <div className="min-w-[600px] flex flex-col gap-2 items-center">
                      {['A','B','C','D','E','F','G','H','I','J'].map(row => (
                        <div key={row} className="flex items-center gap-2">
                          <span className="w-6 text-center text-xs font-bold text-gray-500">{row}</span>
                          <div className="flex gap-2">
                            {seats.filter(s => s.row === row).map(seat => {
                              const isOccupied = seat.status === 'occupied' || bookedSeats.has(seat.id);
                              const isSelected = selectedSeats.some(s => s.id === seat.id);
                              let seatClass = "w-8 h-8 rounded-t-lg rounded-b-sm transition-all duration-200 flex items-center justify-center text-[10px] font-medium";
                              if (isOccupied) seatClass = cn(seatClass, "bg-seat-occupied text-gray-500 cursor-not-allowed opacity-50");
                              else if (isSelected) seatClass = cn(seatClass, "bg-seat-selected text-white shadow-[0_0_10px_rgba(229,9,20,0.5)] scale-110");
                              else if (seat.type === 'vip') seatClass = cn(seatClass, "bg-seat-available border border-seat-vip/50 text-seat-vip hover:bg-seat-vip/20 cursor-pointer");
                              else if (seat.type === 'couple') seatClass = cn(seatClass, "bg-seat-available border border-seat-couple/50 text-seat-couple hover:bg-seat-couple/20 cursor-pointer w-[72px]");
                              else seatClass = cn(seatClass, "bg-seat-available border border-white/10 text-gray-400 hover:bg-white/10 cursor-pointer");
                              return (
                                <button key={seat.id} disabled={isOccupied} onClick={() => handleSeatClick(seat)} className={seatClass}>
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
                    <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-seat-available border border-white/10" /><span className="text-xs text-gray-400">Available</span></div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-seat-selected shadow-[0_0_8px_rgba(229,9,20,0.5)]" /><span className="text-xs text-gray-400">Selected</span></div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-seat-occupied opacity-50" /><span className="text-xs text-gray-400">Occupied</span></div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-seat-available border border-seat-vip/50" /><span className="text-xs text-gray-400">VIP ($15)</span></div>
                    <div className="flex items-center gap-2"><div className="w-11 h-5 rounded-t bg-seat-available border border-seat-couple/50" /><span className="text-xs text-gray-400">Couple ($25)</span></div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <h2 className="text-2xl font-display font-bold mb-6">Payment Details</h2>
                {bookingError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{bookingError}</div>
                )}
                <div className="bg-surface rounded-xl p-6 border border-white/5">
                  <h3 className="text-lg font-medium mb-4">Select Payment Method</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button className="p-4 rounded-lg border border-primary bg-primary/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center"><span className="text-black font-bold text-xs">CC</span></div>
                        <span className="font-medium">Credit Card</span>
                      </div>
                      <div className="w-4 h-4 rounded-full border-4 border-primary bg-background" />
                    </button>
                    <button className="p-4 rounded-lg border border-white/10 bg-background hover:border-white/30 flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#00457C] rounded flex items-center justify-center"><span className="text-white font-bold text-xs italic">Pay</span></div>
                        <span className="font-medium">PayPal</span>
                      </div>
                      <div className="w-4 h-4 rounded-full border border-white/30" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" defaultValue="4111 1111 1111 1111" className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Expiry Date</label>
                        <input type="text" placeholder="MM/YY" defaultValue="12/28" className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">CVV</label>
                        <input type="text" placeholder="123" defaultValue="123" className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Cardholder Name</label>
                      <input type="text" placeholder="JOHN DOE" defaultValue={user?.name?.toUpperCase() || 'JOHN DOE'} className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-2 text-center">Booking Confirmed!</h2>
                <p className="text-gray-400 text-center mb-8">Your ticket has been saved. A confirmation email will be sent if email is configured.</p>

                <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl relative">
                  <div className="h-32 relative">
                    <img src={movie.backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <span className="text-white font-display font-bold text-xl tracking-wider">CINEMAX</span>
                      <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">E-TICKET</span>
                    </div>
                  </div>
                  <div className="p-6 bg-white text-black relative">
                    <div className="absolute -left-4 -top-4 w-8 h-8 bg-background rounded-full" />
                    <div className="absolute -right-4 -top-4 w-8 h-8 bg-background rounded-full" />
                    <div className="absolute left-4 right-4 -top-[1px] border-t-2 border-dashed border-gray-300" />
                    <h3 className="text-2xl font-bold mb-1">{movie.title}</h3>
                    <p className="text-sm text-gray-500 mb-6">{cinemas.find(c => c.id === selectedCinema)?.name}</p>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                      <div><p className="text-xs text-gray-500 uppercase">Date</p><p className="font-bold">{format(selectedDate, 'dd MMM yyyy')}</p></div>
                      <div><p className="text-xs text-gray-500 uppercase">Time</p><p className="font-bold">{selectedShowtime?.time}</p></div>
                      <div><p className="text-xs text-gray-500 uppercase">Screen</p><p className="font-bold">{selectedShowtime?.screen}</p></div>
                      <div><p className="text-xs text-gray-500 uppercase">Seats</p><p className="font-bold text-primary">{selectedSeats.map(s => s.id).join(', ')}</p></div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Booking ID</p>
                        <p className="font-mono font-bold text-sm">{bookingId}</p>
                      </div>
                      <div className="p-2 bg-white border border-gray-200 rounded-lg">
                        <QRCodeSVG value={bookingId || 'ticket'} size={64} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button onClick={() => navigate('/')} className="px-6 py-3 bg-surface hover:bg-surface-light text-white font-medium rounded-lg transition-colors">Back to Home</button>
                  <button onClick={() => navigate('/tickets')} className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors">View My Tickets</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar / Summary */}
        {step < 4 && (
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-surface rounded-xl p-6 border border-white/5 sticky top-24">
              <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-4">Booking Summary</h3>
              <div className="flex gap-4 mb-6">
                <img src={movie.posterUrl} alt={movie.title} className="w-16 h-24 object-cover rounded-md" />
                <div>
                  <h4 className="font-bold text-white leading-tight mb-1">{movie.title}</h4>
                  <p className="text-xs text-gray-400">{movie.duration} min • {movie.rating}</p>
                </div>
              </div>
              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-white/10">
                <div className="flex justify-between"><span className="text-gray-400">Cinema</span><span className="font-medium text-right max-w-[150px] truncate">{selectedCinema ? cinemas.find(c => c.id === selectedCinema)?.name : '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="font-medium">{format(selectedDate, 'dd MMM yyyy')}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Time</span><span className="font-medium">{selectedShowtime ? selectedShowtime.time : '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Seats</span><span className="font-medium text-primary">{selectedSeats.length > 0 ? selectedSeats.map(s => s.id).join(', ') : '-'}</span></div>
              </div>
              <div className="flex justify-between items-end mb-6">
                <span className="text-gray-400">Total Price</span>
                <span className="text-2xl font-bold text-white">${totalPrice.toFixed(2)}</span>
              </div>

              {step === 1 && (
                <button disabled={!selectedShowtime} onClick={() => setStep(2)} className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-surface-light disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                  Select Seats <ChevronRight className="w-5 h-5" />
                </button>
              )}
              {step === 2 && (
                <button disabled={selectedSeats.length === 0} onClick={() => setStep(3)} className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-surface-light disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                  Continue to Payment <ChevronRight className="w-5 h-5" />
                </button>
              )}
              {step === 3 && (
                <button onClick={handleConfirmBooking} disabled={confirming} className="w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(229,9,20,0.4)]">
                  {confirming ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Processing...</> : `Pay $${totalPrice.toFixed(2)}`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
