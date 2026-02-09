import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Plus, MessageSquare, Target, Zap, Users, Share2, X } from 'lucide-react';
import { Show } from '../../types';
import { getShowById, getShowVideos } from '../../services/tmdbService';
import { boardService } from '../../services/boardService';
import { Radio } from 'lucide-react';

interface Reaction {
    id: string;
    timestamp: number; // in seconds
    user: string;
    content: string;
    type: 'theory' | 'detail' | 'hype';
}

const WarRoomPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [show, setShow] = useState<Show | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [played, setPlayed] = useState(0); // 0 to 1
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [isTagging, setIsTagging] = useState(false);
    const [newTagContent, setNewTagContent] = useState('');

    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);

    const playerRef = useRef<any>(null);
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    const checkSignal = async (showId: string, showType: 'movie' | 'tv') => {
        const url = await getShowVideos(showId, showType);
        if (url) {
            setVideoUrl(url);
            setIsScanning(false);
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        }
    };

    useEffect(() => {
        const loadShow = async () => {
            if (id) {
                // Try TV first, then Movie
                let data = await getShowById(id, 'tv');
                let type: 'tv' | 'movie' = 'tv';

                if (!data) {
                    data = await getShowById(id, 'movie');
                    type = 'movie';
                }

                if (data) {
                    setShow(data);

                    // Initial check
                    await checkSignal(id, type);

                    // Start polling/scanning simulation
                    if (!videoUrl) {
                        pollingInterval.current = setInterval(() => {
                            checkSignal(id, type);
                        }, 5000);
                    }
                }
            }
        };
        loadShow();

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [id]);

    const handleProgress = (state: { played: number; playedSeconds: number }) => {
        setPlayed(state.played);
        setCurrentTime(state.playedSeconds);
    };

    const handleDuration = (d: number) => {
        setDuration(d);
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleTagClick = () => {
        setIsPlaying(false);
        setIsTagging(true);
    };

    const submitTag = async () => {
        if (!newTagContent || !show) return;

        // 1. Optimistic UI update for local view
        const newReaction: Reaction = {
            id: Date.now().toString(),
            timestamp: currentTime,
            user: 'CurrentUser',
            content: newTagContent,
            type: 'theory'
        };
        setReactions([...reactions, newReaction].sort((a, b) => a.timestamp - b.timestamp));

        // 2. Persist to Global Timeline
        await boardService.addTimelineEvent(show.id, {
            timestamp: formatTime(currentTime),
            description: newTagContent,
            author: 'CurrentUser' // In a real app, from auth context
        });

        setIsTagging(false);
        setNewTagContent('');
        setIsPlaying(true);
    };

    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        return `${mm}:${ss}`;
    };

    if (!show) return <div className="text-white pt-32 text-center">Loading War Room...</div>;

    // Filter reactions visible around current time (within 5 seconds)
    const activeReactions = reactions.filter(r => Math.abs(r.timestamp - currentTime) < 3);

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 md:px-8 md:py-6 bg-gradient-to-b from-black to-transparent flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition-colors">
                        <X className="w-4 h-4" /> Exit War Room
                    </button>
                    <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase">
                        <span className="text-red-600 mr-2">LIVE</span>
                        THEORY EVENT
                    </h1>
                    <p className="text-sm font-mono text-slate-500 tracking-widest uppercase">
                        {show.title} / Final Season Trailer Breakdown
                    </p>
                </div>
                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-full">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">3,428 Active Agents</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative h-screen flex flex-col justify-center items-center">

                {/* Video Container */}
                <div className="relative w-full max-w-6xl aspect-video bg-black rounded-lg overflow-hidden border border-white/10 group">
                    {isScanning ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 space-y-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-2 border-red-600/30 animate-ping absolute inset-0" />
                                <div className="w-24 h-24 rounded-full border-2 border-red-600/50 flex items-center justify-center bg-black">
                                    <Radio className="w-10 h-10 text-red-500 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-white uppercase tracking-widest animate-pulse">Scanning Frequency...</h3>
                                <p className="text-red-500 font-mono text-sm">Waiting for Official Drop • Signal Strength: Low</p>
                            </div>
                        </div>
                    ) : (
                        <ReactPlayer
                            ref={playerRef}
                            url={videoUrl || ''}
                            width="100%"
                            height="100%"
                            playing={isPlaying}
                            onProgress={handleProgress}
                            onDuration={handleDuration}
                            controls={false}
                            config={{
                                youtube: {
                                    playerVars: { showinfo: 0, controls: 0, modestbranding: 1 }
                                }
                            }}
                        />
                    )}

                    {/* Custom Controls Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 md:p-8">
                        <div className="flex justify-end">
                            {/* Top Right Controls if needed */}
                        </div>

                        <div className="space-y-4">
                            {/* Scrubber */}
                            <div className="relative h-12 flex items-center">
                                {/* Reaction Markers on Timeline */}
                                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-white/20 rounded-full overflow-visible">
                                    <div
                                        className="h-full bg-red-600 relative"
                                        style={{ width: `${played * 100}%` }}
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full scale-0 group-hover:scale-100 transition-transform" />
                                    </div>
                                    {reactions.map(r => (
                                        <div
                                            key={r.id}
                                            className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-yellow-400/50 hover:bg-yellow-400 hover:h-6 transition-all cursor-pointer"
                                            style={{ left: `${(r.timestamp / duration) * 100}%` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button onClick={togglePlay} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                    </button>
                                    <div className="text-2xl font-mono font-bold tracking-widest text-white/90">
                                        {formatTime(currentTime)} <span className="text-white/30">/ {formatTime(duration)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleTagClick}
                                    className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-3 transition-all"
                                >
                                    <Target className="w-5 h-5" />
                                    Tag Intel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tagging Input Overlay */}
                    <AnimatePresence>
                        {isTagging && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="w-full max-w-lg bg-[#0B0C10] border border-white/10 p-8 rounded-2xl"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-mono font-bold">
                                            @{formatTime(currentTime)}
                                        </div>
                                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Log Observation</h3>
                                    </div>
                                    <textarea
                                        autoFocus
                                        value={newTagContent}
                                        onChange={(e) => setNewTagContent(e.target.value)}
                                        placeholder="What clue did you spot?"
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:border-red-500 outline-none resize-none mb-6"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                submitTag();
                                            }
                                        }}
                                    />
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => { setIsTagging(false); setIsPlaying(true); }}
                                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-400 font-bold uppercase tracking-wider rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={submitTag}
                                            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider rounded-lg transition-all"
                                        >
                                            Broadcast
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Live Intel Feed */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-80 h-[600px] pointer-events-none hidden xl:block">
                    <div className="w-full h-full flex flex-col justify-end space-y-4 overflow-hidden mask-image-gradient-t">
                        <AnimatePresence>
                            {activeReactions.map(r => (
                                <motion.div
                                    key={r.id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                {r.user[0]}
                                            </div>
                                            <span className="text-xs font-bold text-red-300">{r.user}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500">@{formatTime(r.timestamp)}</span>
                                    </div>
                                    <p className="text-sm text-slate-200 font-light">{r.content}</p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarRoomPage;

