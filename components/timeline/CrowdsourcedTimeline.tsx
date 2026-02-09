import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Show } from '../../types';
import { boardService, TimelineEvent } from '../../services/boardService';
import { Clock, Check, X, ShieldAlert, Plus } from 'lucide-react';

interface TimelineProps {
    show: Show;
    searchQuery?: string;
}

const CrowdsourcedTimeline: React.FC<TimelineProps> = ({ show, searchQuery = '' }) => {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newEvent, setNewEvent] = useState({ timestamp: '', description: '' });

    useEffect(() => {
        const loadTimeline = async () => {
            const data = await boardService.getTimelineEvents(show.id);
            setEvents(data);
        };
        loadTimeline();
    }, [show.id]);

    const handleAddEvent = async () => {
        if (!newEvent.timestamp || !newEvent.description) return;
        const added = await boardService.addTimelineEvent(show.id, {
            timestamp: newEvent.timestamp,
            description: newEvent.description,
            author: 'current-user'
        });
        setEvents([...events, added].sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
        setNewEvent({ timestamp: '', description: '' });
        setIsAdding(false);
    };

    const handleVote = async (id: string, type: 'verify' | 'debunk') => {
        await boardService.voteTimelineEvent(show.id, id, type);
        // Optimistically update UI
        setEvents(events.map(e => {
            if (e.id === id) {
                return {
                    ...e,
                    verifiedCount: type === 'verify' ? e.verifiedCount + 1 : e.verifiedCount,
                    debunkedCount: type === 'debunk' ? e.debunkedCount + 1 : e.debunkedCount
                };
            }
            return e;
        }));
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Clock className="w-6 h-6 text-red-400" />
                        Crowdsourced Timeline
                    </h3>
                    <p className="text-slate-500 font-light text-sm">
                        Collaboratively verified sequence of hidden events.
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-xs font-bold uppercase tracking-wider border border-red-500/20"
                >
                    <Plus className="w-4 h-4" /> Add Event
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Timestamp</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 12:04"
                                    value={newEvent.timestamp}
                                    onChange={e => setNewEvent({ ...newEvent, timestamp: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none text-sm font-mono"
                                />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Observation</label>
                                <input
                                    type="text"
                                    placeholder="Describe the hidden detail..."
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider px-4 py-2">Cancel</button>
                            <button onClick={handleAddEvent} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">Submit to Timeline</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative border-l-2 border-white/10 ml-3 space-y-8 py-4">
                {events.filter(e =>
                    e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    e.timestamp.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative ml-8 group"
                    >
                        {/* Timeline Dot */}
                        <div className="absolute -left-[43px] top-0 w-5 h-5 rounded-full bg-[#0B0C10] border-2 border-red-500/50 flex items-center justify-center group-hover:border-red-400 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        </div>

                        <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl p-5 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-mono font-bold">
                                            {event.timestamp}
                                        </div>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Logged by u/{event.author}</span>
                                    </div>
                                    <p className="text-slate-300 font-light leading-relaxed">{event.description}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleVote(event.id, 'verify')}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-all"
                                    >
                                        <Check className="w-3 h-3" />
                                        <span className="text-xs font-bold">{event.verifiedCount}</span>
                                    </button>
                                    <button
                                        onClick={() => handleVote(event.id, 'debunk')}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 transition-all"
                                    >
                                        <ShieldAlert className="w-3 h-3" />
                                        <span className="text-xs font-bold">{event.debunkedCount}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CrowdsourcedTimeline;
