import React, { useRef } from 'react';
import { Show } from '../types';
import { getFullPosterUrl } from '../services/tmdbService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TiltCard from './TiltCard';
import DecoderText from './DecoderText';

interface TrendingSectionProps {
    title: string;
    shows: Show[];
    onSelect: (show: Show) => void;
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ title, shows, onSelect }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -400 : 400;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
                <div className="w-1 h-6 bg-red-600" />
                <h2 className="text-lg md:text-2xl font-bold text-white">{title}</h2>
            </div>

            <div className="relative group">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-2"
                >
                    <ChevronLeft className="w-8 h-8 text-white" />
                </button>

                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2 pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {shows.map((show) => (
                        <div
                            key={show.id}
                            onClick={() => onSelect(show)}
                            className="flex-shrink-0 relative w-28 md:w-36 lg:w-48 cursor-pointer group/card"
                        >
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-900 border border-white/10 transition-all duration-300 hover:border-white/30">
                                <img
                                    src={getFullPosterUrl(show.posterPath)}
                                    alt={show.title}
                                    className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-90"
                                />
                            </div>
                            <h3 className="text-xs md:text-sm font-medium text-slate-300 group-hover/card:text-white line-clamp-2 px-1 mt-2">
                                {show.title}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-2"
                >
                    <ChevronRight className="w-8 h-8 text-white" />
                </button>
            </div>
        </section>
    );
};

export default TrendingSection;
