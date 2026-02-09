import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Show } from '../types';
import { getFullPosterUrl, getFullBackdropUrl } from '../services/tmdbService';
import { ChevronLeft, ChevronRight, Play, Info, Sparkles } from 'lucide-react';

interface HeroCarouselProps {
    slides: Show[];
    onSelect: (show: Show) => void;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides, onSelect }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            paginate(1);
        }, 8000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prev) => (prev + newDirection + slides.length) % slides.length);
    };

    const currentShow = slides[currentIndex];

    if (!currentShow) return null;

    return (
        <div className="relative h-[55vh] md:h-[60vh] w-full overflow-hidden rounded-[2.5rem] bg-black shadow-2xl group/carousel">
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            src={getFullBackdropUrl(currentShow.backdropPath || currentShow.posterPath)}
                            alt={currentShow.title}
                            className="w-full h-full object-cover transition-transform duration-[20s] scale-100 group-hover/carousel:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10]/40 via-transparent to-transparent" />
                    </div>

                    {/* Content Overlays */}
                    <div className="absolute inset-0 flex flex-col justify-end items-start text-left p-8 md:p-16 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="max-w-3xl space-y-6"
                        >
                            <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
                                <Sparkles className="w-3 h-3 text-red-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">Intelligence Feed</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
                                {currentShow.title}
                            </h1>

                            <p className="text-base md:text-lg text-slate-300 font-medium max-w-xl leading-relaxed line-clamp-2 opacity-90 tracking-wide">
                                {currentShow.overview}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <button
                                    className="group/btn flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-red-500 hover:text-white cursor-default"
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                    <span>Analyze Hub</span>
                                </button>
                                <button
                                    className="flex items-center space-x-2 bg-white/5 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all cursor-default"
                                >
                                    <Info className="w-4 h-4" />
                                    <span>Details</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 right-8 flex items-center space-x-3 z-20">
                <button
                    onClick={() => paginate(-1)}
                    className="p-3 rounded-xl bg-black/20 backdrop-blur-md border border-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={() => paginate(1)}
                    className="p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Progress Indicators */}
            <div className="absolute bottom-8 left-8 flex space-x-2 z-20">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1 transition-all duration-500 rounded-full ${i === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
