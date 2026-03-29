import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Calendar as CalendarIcon, MapPin, CheckCircle2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { generateSeats, type Showtime, type Seat } from '@/data/mock';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/Toast';

// Extracted Components
import { BookingStepIndicator } from '@/components/booking/BookingStepIndicator';
import { SeatMap } from '@/components/booking/SeatMap';
import { BookingSummary } from '@/components/booking/BookingSummary';

type Step = 1 | 2 | 3 | 4;

export function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { movies, cinemas, showtimes: allShowtimes, refreshTickets } = useData();
  const { showToast } = useToast();
  
  const movie = movies.find(m => m.id === id);

  const [step, setStep] = useState<Step>(1);
  const [selectedDate, setSelectedDate] = useState<Date>(
    searchParams.get('date') ? new Date(searchParams.get('date')!) : new Date()
  );
  const [selectedCinema, setSelectedCinema] = useState<string | null>(searchParams.get('cinema'));
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const dates = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i)), []);
  const showtimes = useMemo(() => {
    return allShowtimes.filter(s => {
      const showtimeDate = s.date.includes('T') ? s.date.split('T')[0] : s.date;
      return s.movieId === id && showtimeDate === format(selectedDate, 'yyyy-MM-dd');
    });
  }, [id, selectedDate, allShowtimes]);
  const bookedSeats = useMemo(() => new Set(occupiedSeats), [occupiedSeats]);
  const totalPrice = useMemo(() => selectedSeats.reduce((sum, seat) => sum + seat.price, 0), [selectedSeats]);

  // Fetch occupied seats
  useEffect(() => {
    if (selectedShowtime && selectedCinema && movie) {
      const fetchOccupied = async () => {
        try {
          const cinema = cinemas.find(c => c.id === selectedCinema);
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          const res = await api.get<string[]>(`/bookings/occupied-seats?movieTitle=${encodeURIComponent(movie.title)}&cinemaName=${encodeURIComponent(cinema?.name || '')}&showtime=${selectedShowtime.time}&screen=${selectedShowtime.screen}&date=${dateStr}`);
          setOccupiedSeats(res);
        } catch (e) {
          console.error('Failed to fetch occupied seats', e);
        }
      };
      fetchOccupied();
    }
  }, [selectedShowtime, selectedCinema, selectedDate, movie?.title]);

  // Initial step setup
  useEffect(() => {
    const initialTime = searchParams.get('time');
    const initialCinema = searchParams.get('cinema');
    if (initialTime && initialCinema && showtimes.length > 0 && !selectedShowtime) {
      const found = showtimes.find(s => s.time === initialTime && s.cinemaId === initialCinema);
      if (found) { setSelectedShowtime(found); setStep(2); }
    }
  }, [searchParams, showtimes, selectedShowtime]);

  useEffect(() => {
    setSelectedSeats([]);
    setSeats([]); // Reset seats layout to force regeneration based on room capacity
  }, [selectedShowtime?.id]);

  useEffect(() => {
    if (step === 2 && seats.length === 0 && selectedShowtime && selectedCinema) {
      const cinema = cinemas.find(c => c.id === selectedCinema);
      const room = cinema?.rooms.find(r => r.name === selectedShowtime.screen);
      setSeats(generateSeats(room?.capacity));
    }
  }, [step, seats.length, selectedShowtime, selectedCinema, cinemas]);

  if (!movie) return <div className="p-12 text-center">Movie not found</div>;

  const isShowtimePast = (st: Showtime) => {
    const [h, m] = st.time.split(':').map(Number);
    const stDate = new Date(selectedDate);
    stDate.setHours(h, m, 0, 0);
    return stDate < new Date();
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied' || bookedSeats.has(seat.id)) return;
    setSelectedSeats(prev => prev.some(s => s.id === seat.id) ? prev.filter(s => s.id !== seat.id) : prev.length < 8 ? [...prev, seat] : prev);
  };

  const handleConfirmBooking = async () => {
    if (!user) { navigate('/login'); return; }
    setConfirming(true); setBookingError('');
    try {
      const cinema = cinemas.find(c => c.id === selectedCinema);
      const res = await api.post<{ id: string }>('/bookings', {
        movieId: movie.id, 
        showtimeId: selectedShowtime?.id, 
        cinemaId: selectedCinema,
        seats: selectedSeats.map(s => s.id), 
        totalPrice, 
        bookingDate: selectedDate.toISOString(),
        showtime: selectedShowtime?.time, 
        cinemaName: cinema?.name, 
        screen: selectedShowtime?.screen,
        movieTitle: movie.title, 
        userId: user.id,
      });
      setOccupiedSeats(p => [...p, ...selectedSeats.map(s => s.id)]);
      setSelectedSeats([]); 
      await refreshTickets();
      showToast("Booking confirmed! Enjoy your movie.", "success");
      setBookingId(res.id); 
      setStep(4);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to confirm booking.');
      showToast(err.message || "Something went wrong. Please try again.", "error");
    } finally { setConfirming(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <button onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <BookingStepIndicator currentStep={step} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 text-white">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2 text-white">
                    <CalendarIcon className="w-5 h-5 text-primary" /> Select Date
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                    {dates.map((date, i) => {
                      const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                      return (
                        <button key={i} onClick={() => { setSelectedDate(date); setSelectedShowtime(null); }} className={cn("flex flex-col items-center justify-center min-w-[90px] p-4 rounded-2xl border transition-all snap-start", isSelected ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105" : "bg-surface border-white/5 text-gray-400 hover:border-white/20 hover:text-white")}>
                          <span className="text-[10px] font-black uppercase tracking-widest">{format(date, 'MMM')}</span>
                          <span className="text-3xl font-black my-1">{format(date, 'dd')}</span>
                          <span className="text-[10px] opacity-60 font-bold uppercase">{format(date, 'EEE')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2 text-white">
                    <MapPin className="w-5 h-5 text-primary" /> Select Cinema & Time
                  </h2>
                  <div className="space-y-8">
                    {cinemas.map(cinema => {
                      const cinemaShowtimes = showtimes.filter(s => s.cinemaId === cinema.id);
                      if (cinemaShowtimes.length === 0) return null;
                      return (
                        <div key={cinema.id} className="bg-surface rounded-2xl p-6 border border-white/5 shadow-2xl">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-xl font-bold text-white">{cinema.name}</h3>
                              <p className="text-sm text-gray-500 font-medium">{cinema.address}</p>
                            </div>
                            <span className="text-[10px] font-black px-2 py-1 bg-white/5 rounded-lg text-gray-400 border border-white/5">{cinema.distance}</span>
                          </div>
                          <div className="flex flex-wrap gap-4">
                            {cinemaShowtimes.map(st => {
                              const isPast = isShowtimePast(st);
                              const isSelected = selectedShowtime?.id === st.id;
                              return (
                                <button key={st.id} disabled={isPast} onClick={() => { setSelectedCinema(cinema.id); setSelectedShowtime(st); }} className={cn("px-6 py-3 rounded-xl border transition-all flex flex-col items-center min-w-[100px]", isPast ? "opacity-30 cursor-not-allowed grayscale" : isSelected ? "bg-primary/20 border-primary text-primary" : "bg-background border-white/5 text-gray-300 hover:border-white/20 hover:scale-105")}>
                                  <span className="text-xl font-black">{st.time}</span>
                                  <span className="text-[10px] font-bold uppercase tracking-tight opacity-60 mt-1">{st.format} • {st.screen}</span>
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
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <SeatMap seats={seats} selectedSeats={selectedSeats} bookedSeats={bookedSeats} onSeatClick={handleSeatClick} />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <h2 className="text-3xl font-display font-black mb-8 text-white">Secure Checkout</h2>
                {bookingError && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-500/5 transition-all animate-pulse"> {bookingError} </div>}
                <div className="bg-surface rounded-2xl p-8 border border-white/5 shadow-2xl">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Payment Method</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <button className="p-5 rounded-2xl border-2 border-primary bg-primary/10 flex items-center justify-between text-white transition-all transform scale-105">
                      <div className="flex items-center gap-4"><div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg"><span className="text-black font-black text-xs">VISA</span></div><span className="font-bold">Credit Card</span></div>
                      <div className="w-5 h-5 rounded-full border-4 border-primary bg-white shadow-inner" />
                    </button>
                    <button className="p-5 rounded-2xl border border-white/5 bg-background hover:border-white/20 flex items-center justify-between text-gray-500 transition-all opacity-60">
                      <div className="flex items-center gap-4"><div className="w-10 h-10 bg-[#00457C] rounded-lg flex items-center justify-center"><span className="text-white font-black text-xs italic">Pay</span></div><span className="font-bold">PayPal</span></div>
                      <div className="w-5 h-5 rounded-full border border-white/20" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Card Number</label><input type="text" defaultValue="4111 1111 1111 1111" className="w-full bg-background border border-white/5 rounded-xl px-5 py-4 text-white font-mono focus:outline-none focus:border-primary transition-all focus:ring-4 focus:ring-primary/10" /></div>
                    <div className="grid grid-cols-2 gap-6">
                      <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Expiry Date</label><input type="text" defaultValue="12/28" className="w-full bg-background border border-white/5 rounded-xl px-5 py-4 text-white font-mono focus:outline-none focus:border-primary transition-all focus:ring-4 focus:ring-primary/10" /></div>
                      <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">CVV</label><input type="text" defaultValue="123" className="w-full bg-background border border-white/5 rounded-xl px-5 py-4 text-white font-mono focus:outline-none focus:border-primary transition-all focus:ring-4 focus:ring-primary/10" /></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-display font-black mb-3 text-white">Booking Success!</h2>
                <p className="text-gray-500 font-medium text-center mb-12 max-w-sm">Collect your QR Code below. We've sent the receipt to your registered email.</p>

                <div className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
                  <div className="h-40 relative">
                    <img src={movie.backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                    <div className="absolute bottom-6 left-8 flex flex-col">
                      <span className="text-primary-light font-black text-[10px] uppercase tracking-[0.2em] mb-1">Electronic Ticket</span>
                      <h3 className="text-2xl font-black text-white">{movie.title}</h3>
                    </div>
                  </div>
                  <div className="p-8 bg-white text-black relative">
                    <div className="absolute -left-5 -top-5 w-10 h-10 bg-background rounded-full" />
                    <div className="absolute -right-5 -top-5 w-10 h-10 bg-background rounded-full" />
                    <div className="absolute left-8 right-8 -top-[1px] border-t-2 border-dashed border-gray-200" />
                    <div className="grid grid-cols-2 gap-y-6 mb-8">
                      <div><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 transition-all">Date</p><p className="font-bold text-lg">{format(selectedDate, 'dd MMM yyyy')}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 transition-all">Time</p><p className="font-bold text-lg">{selectedShowtime?.time}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 transition-all">Screen</p><p className="font-bold text-lg">{selectedShowtime?.screen}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 transition-all text-primary">Seats</p><p className="font-bold text-lg text-primary">{selectedSeats.map(s => s.id).join(', ')}</p></div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-8">
                      <div><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 transition-all">Ticket ID</p><p className="font-mono font-bold text-xs opacity-60">#{bookingId?.substring(0, 16).toUpperCase()}</p></div>
                      <div className="p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm"><QRCodeSVG value={bookingId || 'ticket'} size={72} /></div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                  <button onClick={() => navigate('/')} className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/5">Home</button>
                  <button onClick={() => navigate('/tickets')} className="flex-1 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20">View Tickets</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step < 4 && (
          <div className="w-full lg:w-96 shrink-0">
            <BookingSummary 
              step={step} movie={movie} selectedCinema={selectedCinema} cinemas={cinemas} selectedDate={selectedDate} selectedShowtime={selectedShowtime} 
              selectedSeats={selectedSeats} totalPrice={totalPrice} onNextStep={() => setStep((step + 1) as Step)} onConfirm={handleConfirmBooking} confirming={confirming} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
