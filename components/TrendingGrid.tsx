import React from 'react';
import { Show } from '../types';
import { getFullPosterUrl } from '../services/tmdbService';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

interface TrendingGridProps {
  shows: Show[];
  onSelect: (show: Show) => void;
}

const TrendingGrid: React.FC<TrendingGridProps> = ({ shows, onSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
      {shows.map((show, idx) => (
        <motion.div
          key={show.id}
          onClick={() => onSelect(show)}
          className="group relative cursor-pointer"
        >
          {/* Card Container with Premium Glass Effect */}
          <div className="relative aspect-[2/3] rounded-[1rem] overflow-hidden bg-[#0a0a0a] border border-white/5 transition-all duration-300 hover:border-white/20">

            {/* Tech Accent - Top Right */}
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
              <div className="w-8 h-8 border-t border-r border-red-500/60 rounded-tr-lg" />
            </div>

            <img
              src={getFullPosterUrl(show.posterPath)}
              alt={show.title}
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
            />

            {/* Cinematic Gradient Overlay (Bottom 40%) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content Layer */}
            <div className="absolute inset-x-0 bottom-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center space-x-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.25em]">Mystery Identified</span>
              </div>

              <h3 className="text-lg font-bold text-white leading-tight mb-4 group-hover:text-red-100 transition-colors">{show.title}</h3>

              <div className="flex items-center justify-between border-t border-white/10 pt-4 opacity-0 group-hover:opacity-100 transition-opacity delay-200">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold group-hover:text-white transition-colors">Analyze Lab</span>
                <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-red-500 group-hover:border-red-500 transition-colors">
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TrendingGrid;
