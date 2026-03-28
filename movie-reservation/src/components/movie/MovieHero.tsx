import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Star, Clock, Ticket } from 'lucide-react';
import { Movie } from '@/data/mock';
import { cn } from '@/lib/utils';

interface MovieHeroProps {
  movie: Movie;
  onWatchTrailer: () => void;
  className?: string;
}

export function MovieHero({ movie, onWatchTrailer, className }: MovieHeroProps) {
  return (
    <section className={cn("relative h-[70vh] md:h-[80vh] w-full overflow-hidden", className)}>
      <div className="absolute inset-0">
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl space-y-6"
        >
          <div className="flex items-center gap-3 text-[10px] font-black tracking-widest uppercase">
            <span className="px-3 py-1 bg-primary text-white rounded-lg shadow-lg shadow-primary/20">
              Now Showing
            </span>
            <span className="flex items-center gap-1.5 text-yellow-500 bg-white/5 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
              <Star className="w-3.5 h-3.5 fill-current" />
              {movie.rating}
            </span>
            <span className="flex items-center gap-1.5 text-blue-400 bg-white/5 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
              <Clock className="w-3.5 h-3.5" />
              {movie.duration}m
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-display font-black text-white leading-[0.9] tracking-tighter">
            {movie.title}
          </h1>

          <p className="text-lg text-gray-300 line-clamp-3 md:line-clamp-none leading-relaxed font-medium max-w-xl">
            {movie.synopsis}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
             {movie.genre.map((g, i) => (
                <span key={g} className="flex items-center gap-2">
                   {g} {i < movie.genre.length - 1 && <span className="w-1 h-1 rounded-full bg-primary" />}
                </span>
             ))}
          </div>

          <div className="pt-6 flex flex-wrap items-center gap-4">
            <Link
              to={`/booking/${movie.id}`}
              className="px-8 py-5 bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all flex items-center gap-3 shadow-[0_20px_40px_rgba(229,9,20,0.3)] hover:-translate-y-1 active:scale-95"
            >
              <Ticket className="w-5 h-5" />
              Secure Seats
            </Link>
            <button 
              onClick={onWatchTrailer}
              className="px-8 py-5 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all flex items-center gap-3 backdrop-blur-xl border border-white/10 hover:border-white/20 active:scale-95"
            >
              <Play className="w-5 h-5" />
              Experience Trailer
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
