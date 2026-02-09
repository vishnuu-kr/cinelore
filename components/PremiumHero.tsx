import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Show, Theory } from '../types';
import { getFullPosterUrl } from '../services/tmdbService';
import Search from './Search';
import TrendingTheoriesSection from './TrendingTheoriesSection';
import DecoderText from './DecoderText';

interface PremiumHeroProps {
    shows: Show[];
    trendingTheories: Theory[];
    onSelectTheory: (theory: Theory) => void;
    onSelectShow: (show: Show) => void;
}

const PremiumHero: React.FC<PremiumHeroProps> = ({ shows, trendingTheories, onSelectTheory, onSelectShow }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Parallax Effects Removed

    // Triple the shows to ensure smooth infinite scroll without gaps
    const marqueeShows = [...shows, ...shows, ...shows];
    const row1 = marqueeShows.slice(0, Math.ceil(marqueeShows.length / 2));
    const row2 = marqueeShows.slice(Math.ceil(marqueeShows.length / 2));

    return (
        <div ref={containerRef} className="relative w-full min-h-[100dvh] overflow-hidden bg-black flex flex-col justify-start pb-20">
            {/* Background Marquee Layer - Now Interactive */}
            <div className="absolute inset-0 flex flex-col gap-4 md:gap-6 opacity-20 md:opacity-60 rotate-[-2deg] md:rotate-[-3deg] scale-105 md:scale-110 origin-center pointer-events-auto h-[120%] -top-[10%]">
                {/* Row 1 - Left */}
                <motion.div
                    className="flex gap-4 md:gap-6 w-max hover:[animation-play-state:paused]"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ ease: "linear", duration: 60, repeat: Infinity }}
                >
                    {row1.map((show, i) => (
                        <motion.div
                            key={`${show.id}-${i}-1`}
                            className="relative w-[25vw] sm:w-[20vw] md:w-[15vw] max-w-[240px] aspect-[2/3] rounded-lg overflow-hidden border border-white/5 opacity-80"
                            initial={{ filter: "grayscale(100%)" }}
                        >
                            <img
                                src={getFullPosterUrl(show.posterPath)}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/poster:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/50 group-hover/poster:bg-transparent transition-colors duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 translate-y-full group-hover/poster:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black to-transparent">
                                <p className="text-white text-[10px] md:text-xs font-bold truncate">{show.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Row 2 - Right */}
                <motion.div
                    className="flex gap-4 md:gap-6 w-max hover:[animation-play-state:paused]"
                    animate={{ x: ["-50%", "0%"] }}
                    transition={{ ease: "linear", duration: 70, repeat: Infinity }}
                >
                    {row2.map((show, i) => (
                        <motion.div
                            key={`${show.id}-${i}-2`}
                            className="relative w-[25vw] sm:w-[20vw] md:w-[15vw] max-w-[240px] aspect-[2/3] rounded-lg overflow-hidden border border-white/5 opacity-80"
                            initial={{ filter: "grayscale(100%)" }}
                        >
                            <img
                                src={getFullPosterUrl(show.posterPath)}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/poster:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/50 group-hover/poster:bg-transparent transition-colors duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 translate-y-full group-hover/poster:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black to-transparent">
                                <p className="text-white text-[10px] md:text-xs font-bold truncate">{show.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Gradient Overlays - Adjusted for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/80 to-[#0B0C10]/40 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0B0C10_100%)] pointer-events-none" />

            {/* Hero Content - Parallaxed */}
            <motion.div
                className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center px-4 space-y-6 md:space-y-10 pointer-events-none pt-24 md:pt-32"
            >
                {/* Text Section */}
                <div className="space-y-4 md:space-y-6 pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 rounded-full glass-panel"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] md:text-xs font-semibold tracking-wider text-white/90 uppercase">
                            The Narrative Engine
                        </span>
                    </motion.div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[1.05] max-w-6xl mx-auto px-2">
                        <span className="text-white text-shadow-strong"><DecoderText text="Connecting the dots" /></span> <br />
                        <span className="text-red-600 text-shadow-strong">
                            <DecoderText text="between the frames" />
                        </span>
                    </h1>
                </div>

                {/* Search Bar - Integrated */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="w-full max-w-3xl px-0 sm:px-4 pointer-events-auto"
                >
                    <Search onSelect={onSelectShow} />
                </motion.div>


                {/* Trending Theories - Integrated */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="w-full pointer-events-auto"
                >
                    {trendingTheories.length > 0 && (
                        <div className="glass-panel rounded-2xl p-4 md:p-6">
                            <TrendingTheoriesSection
                                theories={trendingTheories}
                                onSelect={onSelectTheory}
                            />
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* Fade to Content */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0B0C10] to-transparent pointer-events-none" />
        </div>
    );
};

export default PremiumHero;
