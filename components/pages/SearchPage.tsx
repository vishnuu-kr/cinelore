import React, { useState, useEffect, useRef } from 'react';
import { Show, Theory } from '../../types';
import { searchShows, getFullPosterUrl, getTrendingShows, getTrendingAnime } from '../../services/tmdbService';
import { searchManga } from '../../services/mangaService';
import { fetchUniversalTheories } from '../../services/webService';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Loader2, ArrowRight, Activity, Globe, Database, Zap, FileText, Youtube } from 'lucide-react';
import TheorySidebar from '../TheorySidebar';

const SearchPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Show[]>([]);
    const [theories, setTheories] = useState<Theory[]>([]);
    const [recentShows, setRecentShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Sidebar State
    const [selectedTheory, setSelectedTheory] = useState<Theory | null>(null);

    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input & Fetch Recent on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }

        const loadRecent = async () => {
            try {
                const [shows, anime] = await Promise.all([
                    getTrendingShows(),
                    getTrendingAnime()
                ]);
                setRecentShows([...shows.slice(0, 8), ...anime.slice(0, 4)]);
            } catch (e) {
                console.error("Failed to load recent intel");
            }
        };
        loadRecent();
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (!query.trim()) {
                setResults([]);
                setTheories([]);
                setHasSearched(false);
                return;
            }

            setLoading(true);
            setHasSearched(true);
            try {
                // Parallel search for unified results (Media + Theories)
                const [tmdbData, mangaData, universalData] = await Promise.all([
                    searchShows(query, 1),
                    searchManga(query),
                    fetchUniversalTheories(query)
                ]);

                // Combine results
                const combinedShows = [...tmdbData.results, ...mangaData];
                setResults(combinedShows);
                setTheories(universalData);

            } catch (error) {
                console.error("Search failed", error);
            }
            setLoading(false);
        };

        const debounceTimer = setTimeout(() => {
            performSearch();
        }, 800); // Slightly longer debounce for API economy

        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSelectShow = (show: Show) => {
        navigate(`/hub/${show.type}/${show.id}`);
    };

    const displayShows = hasSearched ? results : recentShows;
    const sectionTitle = hasSearched ? `Media Intelligence (${results.length})` : "Recent Intelligence Intercepts";

    return (
        <div className="min-h-screen container mx-auto px-4 lg:px-8 space-y-12 relative pb-20">
            {/* Lore Background Grid */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Search Header */}
            <div className="flex flex-col items-center space-y-8 pt-0">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live Uplink</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">Omni-Search</span>
                    </h1>
                    <p className="text-slate-400 text-sm tracking-[0.3em] uppercase font-medium flex items-center justify-center gap-4">
                        <Database className="w-4 h-4" />
                        <span>Connected to Deep Web Nodes</span>
                        <Globe className="w-4 h-4" />
                    </p>
                </motion.div>

                <div className="w-full max-w-3xl relative group">
                    <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                    <div className="relative flex items-center bg-black/80 border border-white/10 rounded-full px-8 py-6 backdrop-blur-xl transition-all group-focus-within:border-white/20">
                        <SearchIcon className={`w-6 h-6 mr-6 transition-colors ${loading ? 'text-red-500 animate-pulse' : 'text-slate-400 group-focus-within:text-white'}`} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Initialize query protocol..."
                            className="bg-transparent border-none outline-none text-xl md:text-2xl text-white placeholder-slate-700 flex-grow font-light tracking-wide font-mono"
                        />
                        {loading && <Loader2 className="w-6 h-6 text-red-500 animate-spin ml-4" />}
                    </div>
                </div>
            </div>

            {/* Universal Theory Results */}
            {/* Results Grid or Recent Intel */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Activity className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-bold text-white uppercase tracking-widest">{hasSearched ? `MEDIA INTELLIGENCE (${results.length})` : "Recent Intelligence Intercepts"}</h2>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {loading ? (
                        Array.from({ length: 9 }).map((_, i) => (
                            <div key={`skel-${i}`} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex gap-4">
                                <div className="w-24 aspect-[2/3] rounded-xl overflow-hidden bg-white/5 animate-pulse" />
                                <div className="flex-1 space-y-3 py-2">
                                    <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                                    <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
                                    <div className="h-16 w-full bg-white/5 rounded animate-pulse" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {displayShows.map((show, idx) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={`${show.type}-${show.id}`}
                                    onClick={() => handleSelectShow(show)}
                                    className="group cursor-pointer flex gap-4 bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={getFullPosterUrl(show.posterPath)}
                                            alt={show.title}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=200")}
                                        />
                                        <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay" />
                                    </div>

                                    <div className="flex-1 flex flex-col min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border border-white/5 ${show.type === 'movie' ? 'bg-blue-500/10 text-blue-400' : show.type === 'tv' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                {show.type}
                                            </div>
                                            <span className="text-[9px] font-mono text-slate-600">ID: {show.id}</span>
                                        </div>

                                        <h3 className="font-bold text-base text-slate-200 group-hover:text-white transition-colors leading-tight line-clamp-1 mb-2">
                                            {show.title}
                                        </h3>

                                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-auto">
                                            {show.overview || "No intelligent data available for this node."}
                                        </p>

                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                                            <span className="text-[9px] font-bold text-red-500/70 group-hover:text-red-500 uppercase tracking-widest flex items-center gap-2 transition-colors">
                                                Access Node <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </motion.div>
            </div>

            {/* Universal Theory Results */}
            {hasSearched && theories.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Zap className="w-5 h-5 text-red-500" />
                        <h2 className="text-lg font-bold text-white uppercase tracking-widest">Deep Web Intelligence ({theories.length})</h2>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {theories.map((theory, idx) => (
                            <motion.div
                                key={theory.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => setSelectedTheory(theory)}
                                className="group cursor-pointer relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-white/5">
                                        {theory.source === 'youtube' ? <Youtube className="w-3 h-3 inline mr-1" /> : <FileText className="w-3 h-3 inline mr-1" />}
                                        {theory.source || 'Unknown'}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-600">{new Date(theory.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-200 group-hover:text-red-400 mb-2 line-clamp-2 leading-tight">
                                    {theory.title}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4">
                                    {theory.content}
                                </p>
                                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                        {theory.author?.username?.charAt(0) || 'A'}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">u/{theory.author?.username || 'Anonymous'}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State - Only if searched and no results */}
            {
                !loading && hasSearched && results.length === 0 && theories.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 opacity-50 space-y-4"
                    >
                        <div className="text-6xl">📡</div>
                        <h3 className="text-xl font-bold text-slate-300">No Intelligence Found</h3>
                        <p className="text-slate-500">Try adjusting your search vectors.</p>
                    </motion.div>
                )
            }

            {/* Theory Sidebar for reading */}
            <TheorySidebar
                showTitle="Deep Search Protocol"
                theory={selectedTheory}
                isOpen={!!selectedTheory}
                onClose={() => setSelectedTheory(null)}
                onAskAI={() => { /* AI Logic can be connected here */ }}
                themeColor="#E81313"
            />
        </div >
    );
};

export default SearchPage;
