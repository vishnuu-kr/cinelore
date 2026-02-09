import React, { useRef, useState, useEffect } from 'react';
import { Show, Theory } from '../../types';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getFullPosterUrl } from '../../services/tmdbService';
import { mockForumService } from '../../services/mockForumService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PremiumHero from '../PremiumHero';
import TrendingSection from '../TrendingSection';
import TiltCard from '../TiltCard';
import DecoderText from '../DecoderText';

interface HomePageProps {
    trendingShows: Show[];
}

const HomePage: React.FC<HomePageProps> = ({ trendingShows }) => {
    const top10ScrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [trendingTheories, setTrendingTheories] = useState<Theory[]>([]);

    useEffect(() => {
        const loadTheories = async () => {
            const theories = await mockForumService.getTrendingTheories();
            setTrendingTheories(theories);
        };
        loadTheories();
    }, []);

    // Derived state
    const top10Shows = trendingShows.slice(0, 10);
    const movies = trendingShows.filter(s => s.type === 'movie');
    const series = trendingShows.filter(s => s.type === 'tv');
    const anime = trendingShows.filter(s => s.type === 'anime');
    const manga = trendingShows.filter(s => s.type === 'manga');

    const handleSelectShow = (show: Show) => {
        navigate(`/hub/${show.type}/${show.id}`);
    };

    const handleSelectTheory = (theory: Theory) => {
        if (theory.show_type && theory.show_id) {
            navigate(`/hub/${theory.show_type}/${theory.show_id}?theoryId=${theory.id}`);
        }
    };

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
        >
            <PremiumHero
                shows={trendingShows}
                trendingTheories={trendingTheories}
                onSelectTheory={handleSelectTheory}
                onSelectShow={handleSelectShow}
            />

            <div className="space-y-8 md:space-y-16 px-4 md:px-6 lg:px-8 relative z-10 pb-20">
                {/* TOP 10 Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2 mb-6">
                        <div className="w-1 h-8 bg-red-600" />
                        <h2 className="text-2xl md:text-3xl font-bold text-white uppercase">Top 10 Today</h2>
                    </div>

                    <div className="relative group">
                        {/* Left Arrow */}
                        <button
                            onClick={() => scroll(top10ScrollRef, 'left')}
                            className="absolute left-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-r from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-4"
                        >
                            <ChevronLeft className="w-8 h-8 text-white/50 hover:text-white transition-colors" />
                        </button>

                        {/* Scrollable Container */}
                        <div
                            ref={top10ScrollRef}
                            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-8 pb-8"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {top10Shows.map((show, index) => (
                                <div
                                    key={show.id}
                                    onClick={() => handleSelectShow(show)}
                                    className="flex-shrink-0 relative cursor-pointer group/card w-40 md:w-64 h-64 md:h-96"
                                >
                                    <div className="relative w-full h-full flex items-end transition-transform duration-300 group-hover/card:-translate-y-2">
                                        {/* Minimalist Solid Number */}
                                        <div className="absolute -left-4 bottom-0 z-0 flex items-end justify-start pointer-events-none">
                                            <span className="text-[10rem] leading-[0.7] font-black text-[#1e293b] select-none tracking-tighter">
                                                {index + 1}
                                            </span>
                                        </div>

                                        {/* Clean Poster Card */}
                                        <div className="relative z-10 w-[70%] ml-auto shadow-none">
                                            <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-slate-900 border border-white/10">
                                                <img
                                                    src={getFullPosterUrl(show.posterPath)}
                                                    alt={show.title}
                                                    className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-90"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={() => scroll(top10ScrollRef, 'right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full bg-gradient-to-l from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-2"
                        >
                            <ChevronRight className="w-8 h-8 text-white" />
                        </button>
                    </div>
                </section>

                {/* Stacked Trending Sections */}
                <div id="trending-section" className="space-y-12">
                    {movies.length > 0 && <TrendingSection title="Trending Movies" shows={movies} onSelect={handleSelectShow} />}
                    {series.length > 0 && <TrendingSection title="Trending Series" shows={series} onSelect={handleSelectShow} />}
                    {anime.length > 0 && <TrendingSection title="Trending Anime" shows={anime} onSelect={handleSelectShow} />}
                    {manga.length > 0 && <TrendingSection title="Trending Manga" shows={manga} onSelect={handleSelectShow} />}
                </div>
            </div>
        </motion.div>
    );
};

export default HomePage;
