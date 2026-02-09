import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import TheoryGrid from '../TheoryGrid';
import CrowdsourcedTimeline from '../timeline/CrowdsourcedTimeline';
import { getShowById, getFullBackdropUrl, getFullPosterUrl, getShowKeywords } from '../../services/tmdbService';
import { fetchRedditTheories } from '../../services/redditService';
import { mockForumService } from '../../services/mockForumService';
import { Show, Theory } from '../../types';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import LoreAssistant from '../lore/LoreAssistant';
import TheorySidebar from '../TheorySidebar';
import NarrativeMap from '../NarrativeMap';

const TheoryHubPage: React.FC = () => {
    const { type, id } = useParams<{ type: string; id: string }>();
    const location = useLocation();
    const [show, setShow] = useState<Show | null>(null);
    const [theories, setTheories] = useState<Theory[]>([]);
    const [selectedTheory, setSelectedTheory] = useState<Theory | null>(null);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiFocusedTheory, setAiFocusedTheory] = useState<Theory | null>(null);

    const handleSelectTheory = (theory: Theory) => {
        setSelectedTheory(theory);
    };

    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'map'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [resultLimit, setResultLimit] = useState(24);
    const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);

    // Auto-select theory from URL param when theories are loaded
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const theoryIdFromUrl = queryParams.get('theoryId');

        if (theoryIdFromUrl && theories.length > 0 && !selectedTheory) {
            const targetTheory = theories.find(t => t.id === theoryIdFromUrl);
            if (targetTheory) {
                setSelectedTheory(targetTheory);
            }
        }
    }, [theories, location.search]);

    useEffect(() => {
        const loadData = async () => {
            if (!id || !type) return;
            // Only set major loading true for initial load
            if (resultLimit === 24) setLoading(true);
            else setIsLoadMoreLoading(true);

            try {

                let showData: Show | null | undefined = null;

                // 1. Fetch Show Data
                if (type === 'manga') {
                    const { getMangaDetails } = await import('../../services/mangaService');
                    showData = await getMangaDetails(id);
                } else {
                    // Map 'anime' type to 'tv' for TMDB fetching
                    const tmdbType = type === 'anime' ? 'tv' : type as 'movie' | 'tv';
                    showData = await getShowById(id, tmdbType);
                    if (showData && type === 'anime') {
                        showData.type = 'anime';
                    }
                }


                if (showData) {
                    setShow(showData);

                    // 2. Fetch Context Data (Keywords)
                    // Pass correct type (anime -> tv is handled inside service now, but we pass raw type)
                    const keywords = await getShowKeywords(showData.id, showData.type as any);
                    const contextProfile = {
                        showTitle: showData.title,
                        keywords: keywords
                    };

                    // 3. Fetch Theories (Parallel & Robust)
                    const { fetchUniversalTheories } = await import('../../services/webService');


                    // AUGMENTATION: If title is short/ambiguous (e.g. "Dark"), add context to the SEARCH QUERY
                    let apiSearchQuery = showData.title;
                    if (showData.title.length <= 5) {
                        apiSearchQuery = `${showData.title} TV Series`;
                    }

                    // Use Promise.allSettled to prevent one failure from blocking everything
                    const results = await Promise.allSettled([
                        fetchRedditTheories(apiSearchQuery, resultLimit, undefined, undefined, type),
                        fetchUniversalTheories(apiSearchQuery, type),
                        mockForumService.getTheories(showData.title)
                    ]);


                    const redditTheories = results[0].status === 'fulfilled' ? results[0].value : [];
                    const universalTheories = results[1].status === 'fulfilled' ? results[1].value : [];
                    const localTheories = results[2].status === 'fulfilled' ? results[2].value : [];

                    if (results[0].status === 'rejected') console.error("Reddit Fetch Failed:", results[0].reason);
                    if (results[1].status === 'rejected') console.error("Universal Fetch Failed:", results[1].reason);

                    // Combine raw theories
                    const allTheories = [...localTheories, ...universalTheories, ...redditTheories];

                    // 4. Apply Context Integrity Check
                    const { contextService } = await import('../../services/contextService');
                    const validatedTheories = allTheories.filter(theory => {
                        // Strict validation: Must match title OR keywords significantly
                        // We allow Local/Mock theories to bypass if they don't have enough metadata, but usually they do.
                        // Actually, let's just validate everything.

                        // HACK: If source is reddit, titles can be vague. 
                        // But we want to filter OUT completely unrelated stuff (e.g. "One Piece" showing up in "Naruto").

                        const validation = contextService.validateRelevance(theory, contextProfile);

                        // Threshold: score > 0 means it matched SOMETHING (Title, Character, or Theme).
                        // If score is 0, it's basically noise.
                        // Threshold: score >= 15 means it matched AT LEAST ONE significant entity.
                        // Single keyword match = 15 points. We require MORE than just one generic keyword.
                        // So either:
                        // 1. Title Match (60)
                        // 2. Short Title w/ Compound Match (50)
                        // 3. Two unique keywords (30 + 20 density = 50)
                        // 4. One keyword (15) + Universe Match (15) = 30
                        // A single isolated keyword (15) will FAIL.
                        const isRelevant = validation.score >= 15;
                        if (!isRelevant) {

                        }
                        return isRelevant;
                    });

                    // Sort by relevance score desc, then date
                    validatedTheories.sort((a, b) => {
                        const scoreA = contextService.validateRelevance(a, contextProfile).score;
                        const scoreB = contextService.validateRelevance(b, contextProfile).score;
                        return scoreB - scoreA;
                    });

                    setTheories(validatedTheories);
                }
            } catch (err) {
                console.error("Critical Error Loading Hub Data:", err);
            } finally {
                setLoading(false);
                setIsLoadMoreLoading(false);
            }
        };

        loadData();
    }, [id, type, resultLimit]);

    if (loading) {
        return (
            <div className="relative min-h-screen pt-32 px-6 max-w-7xl mx-auto space-y-16">
                {/* Hero Skeleton */}
                <div className="flex flex-col lg:flex-row gap-8 p-8 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] h-96 animate-pulse">
                    <div className="flex-1 space-y-8">
                        <div className="w-32 h-2 bg-white/10 rounded-full" />
                        <div className="w-3/4 h-20 bg-white/10 rounded-3xl" />
                        <div className="flex gap-4">
                            <div className="w-24 h-6 bg-white/10 rounded-full" />
                            <div className="w-24 h-6 bg-white/10 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="space-y-8">
                    <div className="w-full h-20 bg-white/[0.02] rounded-3xl animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-64 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse p-6 space-y-4">
                                <div className="w-1/3 h-4 bg-white/10 rounded" />
                                <div className="w-3/4 h-6 bg-white/10 rounded" />
                                <div className="space-y-2">
                                    <div className="w-full h-3 bg-white/10 rounded" />
                                    <div className="w-full h-3 bg-white/10 rounded" />
                                    <div className="w-2/3 h-3 bg-white/10 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!show) {
        return <div className="text-white text-center pt-40">Target Not Found</div>;
    }

    return (
        <div className="relative min-h-screen">
            {/* Dynamic Backdrop & Color Background */}
            <div
                className="fixed inset-0 z-0 bg-[#0B0C10]"
                style={{
                    backgroundColor: show.themeColor ? `${show.themeColor}10` : '#0B0C10',
                    backgroundImage: `radial-gradient(circle at top right, ${show.themeColor || '#E81313'}15, transparent 60%), radial-gradient(circle at bottom left, ${show.themeColor || '#E81313'}05, transparent 40%)`
                }}
            >
                {(show.backdropPath || show.posterPath) && (
                    <div className="absolute inset-0">
                        <img
                            src={getFullBackdropUrl(show.backdropPath || show.posterPath)}
                            alt=""
                            className="w-full h-full object-cover opacity-60 blur-sm scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C10]/80 via-transparent to-[#0B0C10]" />
                    </div>
                )}

                {/* Intensified Themed Glow */}
                <div
                    className="absolute top-0 left-0 w-full h-[600px] pointer-events-none"
                    style={{
                        background: `linear-gradient(to bottom, ${show.themeColor || '#E81313'}20, transparent)`
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative z-10 space-y-16 max-w-7xl mx-auto px-6 pt-0 pb-12"
            >
                {/* Cinematic Show Header - Cohesive Identity & Actions */}
                <div className="relative z-50 flex flex-col lg:flex-row gap-10 p-8 bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] backdrop-blur-2xl items-start">

                    {/* Poster Card - Integrated */}
                    {show.posterPath && (
                        <div className="relative shrink-0 w-48 md:w-64 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 group hidden md:block">
                            <img
                                src={getFullPosterUrl(show.posterPath)}
                                alt={show.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                    )}

                    {/* Show Info & Global Stats */}
                    <div className="flex-grow flex flex-col justify-between py-2 space-y-8 lg:space-y-0 h-full min-h-80">
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-8 h-[2px]"
                                    style={{ backgroundColor: show.themeColor || '#00FF41', color: show.themeColor || '#00FF41' }}
                                />
                                <p className="text-slate-500 font-mono text-[9px] tracking-[0.5em] uppercase font-bold">Intelligence Archive</p>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-2xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                                    {show.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="flex items-center gap-2 text-[10px] text-white/70 font-black tracking-widest uppercase">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: show.themeColor || '#00FF41', color: show.themeColor || '#00FF41' }}
                                        />
                                        Quantum Archive Online
                                    </span>
                                    {show.status && (
                                        <span className="px-4 py-1.5 bg-white/10 border border-white/5 rounded-full text-[9px] font-black text-white/90 uppercase tracking-widest backdrop-blur-md">
                                            Status: {show.status}
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-300 text-sm md:text-lg leading-relaxed max-w-3xl font-light border-l-2 border-white/10 pl-6 py-2">
                                    {show.overview}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap items-center gap-4 pt-8">
                            {(show.status === 'Returning Series' || show.status === 'In Production' || show.status === 'Planned' || show.status === 'Post Production' || show.id === '1396') && (
                                <Link
                                    to={`/hub/${type}/${id}/war-room`}
                                    className="group relative px-6 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition-all duration-500 flex items-center gap-3 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        <span className="text-xs uppercase tracking-[0.2em]">Live War Room</span>
                                    </span>
                                </Link>
                            )}

                            <LoreAssistant
                                showTitle={show.title}
                                focusedTheory={aiFocusedTheory}
                                isOpen={isAiOpen}
                                onClose={() => { setIsAiOpen(false); setAiFocusedTheory(null); }}
                                onOpen={() => { setIsAiOpen(true); setAiFocusedTheory(null); }}
                            />

                            <Link
                                to={`/hub/${type}/${id}/create`}
                                className="group relative px-8 py-4 bg-white text-black hover:bg-slate-200 font-black rounded-xl transition-all duration-500 flex items-center gap-3 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    <span className="text-xs uppercase tracking-[0.2em]">Propagate Theory</span>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div >

                {/* Content Control Hub - Positioned just before theories */}
                < div className="space-y-10" >
                    {/* Dynamic Control Deck - Refined Layout */}
                    < div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 p-6 bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] backdrop-blur-3xl" >
                        <div className="relative group flex-grow max-w-xl">
                            <div className="absolute inset-y-0 left-6 hidden md:flex items-center pointer-events-none">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-4 animate-pulse" />
                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] group-focus-within:text-white transition-colors">Neural Search</span>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Connect specific dots..."
                                className="block w-full pl-6 md:pl-44 pr-6 py-5 border border-white/5 rounded-2xl leading-5 bg-black/40 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 transition-all duration-500 text-sm font-medium tracking-wide"
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
                            {['grid', 'timeline', 'map'].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode as any)}
                                    className={`px-4 md:px-8 py-2 md:py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${viewMode === mode
                                        ? 'bg-red-600 text-white border-t border-red-400/30'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div >

                    <div className="relative min-h-96">
                        {viewMode === 'grid' && (
                            <TheoryGrid
                                show={show}
                                theories={theories.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.content.toLowerCase().includes(searchQuery.toLowerCase()))}
                                isLoading={loading}
                                onSelectTheory={handleSelectTheory}
                            />
                        )}

                        {viewMode === 'timeline' && (
                            <CrowdsourcedTimeline show={show} searchQuery={searchQuery} />
                        )}

                        {viewMode === 'map' && (
                            <NarrativeMap
                                theories={theories} // Pass all theories (or filtered ones)
                                onSelectTheory={handleSelectTheory}
                                showTitle={show.title}
                            />
                        )}
                    </div>
                </div >

                {/* Show More Button */}
                {
                    viewMode === 'grid' && theories.length > 0 && (
                        <div className="flex justify-center pt-8">
                            <button
                                onClick={() => setResultLimit(prev => prev + 24)}
                                disabled={isLoadMoreLoading}
                                className="group relative px-10 py-4 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-2xl transition-all duration-300 backdrop-blur-md overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <span className="relative z-10 text-xs font-black uppercase tracking-[0.3em]">
                                    {isLoadMoreLoading ? 'Expanding Intel...' : 'Show More Theories'}
                                </span>
                            </button>
                        </div>
                    )
                }


            </motion.div >

            <TheorySidebar
                theory={selectedTheory}
                showTitle={show.title}
                isOpen={!!selectedTheory}
                onClose={() => setSelectedTheory(null)}
                backdropPath={show.backdropPath}
                themeColor={show.themeColor}
                onAskAI={() => {
                    setAiFocusedTheory(selectedTheory);
                    setIsAiOpen(true);
                }}
            />
        </div >
    );
};

export default TheoryHubPage;
