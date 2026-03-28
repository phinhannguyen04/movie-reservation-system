import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { format, addDays, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateSelector } from '@/components/movie/DateSelector';
import { MovieScheduleCard } from '@/components/movie/MovieScheduleCard';
import { cn } from '@/lib/utils';

export function Schedule() {
  const { movies, cinemas, showtimes: allShowtimes, loading } = useData();
  
  // Generate next 7 days (rolling)
  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }).map((_, i) => addDays(today, i));
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);

  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
  const now = new Date();

  // Pure logic for showtime evaluation
  const isShowtimePast = (showtimeTime: string): boolean => {
    const [hours, minutes] = showtimeTime.split(':').map(Number);
    const st = new Date(selectedDate);
    st.setHours(hours, minutes, 0, 0);
    return st < now;
  };

  // Group showtimes by movie, then by cinema
  const scheduleData = useMemo(() => {
    if (loading) return [];
    
    const data: any[] = [];
    
    movies.forEach(movie => {
      // Filter showtimes for this movie and selected date
      // We handle both YYYY-MM-DD and ISO-8601 formats from API
      const showtimes = allShowtimes.filter(s => {
        const showtimeDate = s.date.includes('T') ? s.date.split('T')[0] : s.date;
        return s.movieId === movie.id && showtimeDate === formattedSelectedDate;
      });
      
      if (showtimes.length > 0) {
        const cinemaGroups = cinemas.map(cinema => {
          const cinemaShowtimes = showtimes.filter(s => s.cinemaId === cinema.id);
          return {
            cinema,
            showtimes: cinemaShowtimes
          };
        }).filter(group => group.showtimes.length > 0);

        if (cinemaGroups.length > 0) {
          data.push({
            movie,
            cinemaGroups
          });
        }
      }
    });
    
    return data;
  }, [formattedSelectedDate, allShowtimes, movies, cinemas, loading]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-black text-white tracking-tight">Showtimes</h1>
            <p className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-widest">Reserve your cinematic experience</p>
          </div>
        </div>
      </div>

      <DateSelector 
        dates={dates} 
        selectedDate={selectedDate} 
        onSelect={setSelectedDate} 
        className="mb-12"
      />

      {/* Movie Schedule List */}
      <div className="space-y-10">
        {loading ? (
          <div className="flex justify-center py-24">
             <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : scheduleData.length > 0 ? (
          scheduleData.map(({ movie, cinemaGroups }, index) => (
            <MovieScheduleCard 
              key={movie.id}
              movie={movie}
              cinemaGroups={cinemaGroups}
              index={index}
              formattedSelectedDate={formattedSelectedDate}
              isShowtimePast={isShowtimePast}
            />
          ))
        ) : (
          <div className="py-24 flex flex-col items-center justify-center bg-surface border border-white/5 rounded-3xl">
             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <CalendarIcon className="w-8 h-8 text-gray-700 opacity-20" />
             </div>
             <h3 className="text-xl font-bold text-gray-400">No screenings available for this date</h3>
             <p className="text-sm text-gray-600 mt-2">Try selecting another date on the calendar above</p>
          </div>
        )}
      </div>
    </div>
  );
}

