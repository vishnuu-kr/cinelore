import React, { useEffect, useState } from 'react';
import { Show } from '../../types';
import { getPopularMovies, getPopularTV, getTrendingAnime, getTrendingShows, getFullPosterUrl } from '../../services/tmdbService';
import { getPopularManga } from '../../services/mangaService';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface BrowsePageProps {
    type: 'movie' | 'tv' | 'anime' | 'manga' | 'trending';
    title: string;
}

const BrowsePage: React.FC<BrowsePageProps> = ({ type, title }) => {
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            let data: Show[] = [];
            try {
                switch (type) {
                    case 'movie':
                        data = await getPopularMovies();
                        break;
                    case 'tv':
                        data = await getPopularTV();
                        break;
                    case 'anime':
                        data = await getTrendingAnime();
                        break;
                    case 'manga':
                        data = await getPopularManga();
                        break;
                    case 'trending':
                        data = await getTrendingShows();
                        break;
                }
                setShows(data);
            } catch (error) {
                console.error("Failed to load browse data", error);
            }
            setLoading(false);
        };
        loadData();
    }, [type]);

    const handleSelectShow = (show: Show) => {
        navigate(`/hub/${show.type}/${show.id}`);
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-1 h-8 bg-red-600 rounded-full" />
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight text-white/90">{title}</h1>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 animate-pulse" />
                            <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
        >
            <div className="flex items-center gap-4">
                <div className="w-1 h-8 bg-red-600 rounded-full" />
                <h1 className="text-4xl font-black text-white tracking-tight text-white/90">{title}</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {shows.map((show) => (
                    <div
                        key={show.id}
                        onClick={() => handleSelectShow(show)}
                        className="group cursor-pointer space-y-2"
                    >
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                            <img
                                src={getFullPosterUrl(show.posterPath)}
                                alt={show.title}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-300 group-hover:text-white transition-colors truncate">
                            {show.title}
                        </h3>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default BrowsePage;
