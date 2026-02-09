import React, { useRef } from 'react';
import { Theory } from '../types';
import { ChevronLeft, ChevronRight, MessageSquare, ArrowBigUp, Award, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrendingTheoriesSectionProps {
    theories: Theory[];
    onSelect: (theory: Theory) => void;
}

const TrendingTheoriesSection: React.FC<TrendingTheoriesSectionProps> = ({ theories, onSelect }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -400 : 400;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const getStatusBadge = (theory: Theory) => {
        if (theory.verified_by_expert) {
            return (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 text-red-300 rounded-md ring-1 ring-red-500/40">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Expert Verified</span>
                </div>
            );
        }
        switch (theory.status) {
            case 'confirmed':
                return (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 text-green-300 rounded-md ring-1 ring-green-500/40">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Confirmed</span>
                    </div>
                );
            case 'debunked':
                return (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 text-red-300 rounded-md ring-1 ring-red-500/40">
                        <XCircle className="w-3 h-3" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Debunked</span>
                    </div>
                );
            default: // active
                return (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-md ring-1 ring-yellow-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider">Discussing</span>
                    </div>
                );
        }
    };

    return (
        <section className="space-y-6 py-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-red-600 rounded-full" />
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Trending Theories</h2>
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Community Intelligence</p>
                    </div>
                </div>
            </div>

            <div className="relative group">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-r from-[#0B0C10] to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-start pl-2"
                >
                    <ChevronLeft className="w-8 h-8 text-white/70 hover:text-white" />
                </button>

                {/* Cards Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-6 md:px-2 pb-8 pt-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {theories.map((theory) => (
                        <motion.div
                            key={theory.id}
                            onClick={() => onSelect(theory)}
                            className="flex-shrink-0 w-[75vw] sm:w-[40vw] md:w-[22vw] xl:w-[18vw] max-w-[360px] netflix-card cursor-pointer group/card"
                        >
                            {/* Card Header (Image or Gradient) */}
                            <div className="h-48 relative overflow-hidden rounded-t-lg">
                                {theory.image_url ? (
                                    <>
                                        <img
                                            src={theory.image_url}
                                            alt={theory.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                                        />
                                        <div className="image-overlay" />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                            <MessageSquare className="w-20 h-20 text-red-500" />
                                        </div>
                                    </div>
                                )}

                                <div className="absolute top-3 left-3 z-10">
                                    <span className="badge-clean">
                                        {theory.show_title}
                                    </span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 flex-1 flex flex-col justify-between -mt-2 relative z-10">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        {getStatusBadge(theory)}
                                        {theory.is_bounty && (
                                            <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                                                <Award className="w-3 h-3 fill-current" />
                                                <span className="text-[10px] font-semibold">{theory.bounty_reward?.split(' ')[0]}</span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover/card:text-red-500 transition-colors duration-300">
                                        {theory.title}
                                    </h3>

                                    <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                                        {theory.content}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden">
                                            {theory.author?.avatar_url && (
                                                <img src={theory.author.avatar_url} alt={theory.author.username} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <span className="text-xs text-zinc-400 font-medium truncate max-w-[100px]">
                                            {theory.author?.username || 'Anonymous'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 text-emerald-400">
                                        <ArrowBigUp className="w-4 h-4 fill-current" />
                                        <span className="text-xs font-semibold">{theory.upvotes.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-l from-[#0B0C10] to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-end pr-2"
                >
                    <ChevronRight className="w-8 h-8 text-white/70 hover:text-white" />
                </button>
            </div>
        </section>
    );
};

export default TrendingTheoriesSection;

