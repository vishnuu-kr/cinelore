import React, { useState } from 'react';
import { Show, Theory } from '../types';
import TheorySidebar from './TheorySidebar';
import NarrativeMap from './NarrativeMap';
import { getFullPosterUrl, getFullBackdropUrl } from '../services/tmdbService';
import { Network, Grid, Info, ArrowUp, ArrowRight, User, MessageSquare, ShieldAlert, Play, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TheoryGridProps {
  show: Show;
  theories: Theory[];
  isLoading: boolean;
  onSelectTheory: (theory: Theory) => void;
}

const TheoryGrid: React.FC<TheoryGridProps> = ({ show, theories, isLoading, onSelectTheory }) => {
  const [isStringMapView, setIsStringMapView] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [localTheoryUpdates, setLocalTheoryUpdates] = useState<Record<string, number>>({}); // To track optimistic count changes

  React.useEffect(() => {
    // Load initial votes
    import('../services/mockForumService').then(({ mockForumService }) => {
      mockForumService.getUserVotes('current-user').then((votesMap) => {
        const votesRecord: Record<string, 'up' | 'down'> = {};
        votesMap.forEach((val, key) => {
          if (val !== 0) votesRecord[key] = val > 0 ? 'up' : 'down';
        });
        setUserVotes(votesRecord);
      });
    });
  }, []);

  const handleVote = async (e: React.MouseEvent, theoryId: string) => {
    e.stopPropagation(); // Prevent opening sidebar
    const { mockForumService } = await import('../services/mockForumService');

    // Optimistic Update
    const isUpvoted = userVotes[theoryId] === 'up';
    setUserVotes(prev => {
      const next = { ...prev };
      if (isUpvoted) delete next[theoryId];
      else next[theoryId] = 'up';
      return next;
    });

    setLocalTheoryUpdates(prev => ({
      ...prev,
      [theoryId]: (prev[theoryId] || 0) + (isUpvoted ? -1 : 1)
    }));

    await mockForumService.voteTheory(theoryId, 'current-user', 1);
  };

  return (
    <div className="space-y-8 md:space-y-16 max-w-7xl mx-auto">
      {/* Header Removed to prevent duplication with TheoryHubPage */}

      {isLoading ? (
        <div className="flex flex-col items-center py-32 space-y-6">
          <div className="w-12 h-12 border-2 border-slate-800 border-t-red-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-medium animate-pulse">Synchronizing Semantic Data...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {!isStringMapView ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {theories.map((theory, idx) => (
                <motion.div
                  key={theory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    onSelectTheory(theory);
                  }}
                  className={`group relative backdrop-blur-xl border rounded-[2rem] p-4 md:p-8 transition-all duration-500 cursor-pointer flex flex-col h-full overflow-hidden 
                    ${theory.status === 'confirmed' ? 'bg-emerald-950/30 border-emerald-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]' :
                      theory.status === 'debunked' ? 'bg-slate-900/40 border-slate-700/30 grayscale opacity-75 hover:opacity-100' :
                        'bg-[#121212]/60 border-white/5 hover:border-red-500/40 hover:shadow-[0_0_40px_-10px_rgba(220,38,38,0.25)] hover:bg-[#1A1A1A]/80'}
                  `}
                >
                  {/* Status Overlay */}
                  {theory.status === 'confirmed' && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full z-20 backdrop-blur-md">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Prophet Verified</span>
                    </div>
                  )}
                  {theory.status === 'debunked' && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-full z-20 backdrop-blur-md">
                      <ShieldAlert className="w-3 h-3 text-slate-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Archive (Debunked)</span>
                    </div>
                  )}
                  {theory.verified_by_expert && theory.status !== 'confirmed' && theory.status !== 'debunked' && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full z-20 backdrop-blur-md">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Lore Master Verified</span>
                    </div>
                  )}


                  <div className="flex-1 space-y-6 relative z-10 pt-4">
                    {/* Video Thumbnail Interstitial */}
                    {theory.source === 'youtube' && theory.thumbnail_url && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-5 transition-all border border-white/5">
                        <img src={theory.thumbnail_url} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                          <div className="w-14 h-14 bg-red-600/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-transform duration-300">
                            <Play className="w-6 h-6 text-white fill-current ml-1" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5 group-hover:border-red-500/30 group-hover:bg-red-500/10 transition-colors duration-300">
                          <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-400 transition-colors" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-red-400/80 transition-colors">Agent</span>
                          <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">u/{theory.author?.username || theory.user_id}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleVote(e, theory.id)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300 ${userVotes[theory.id] === 'up'
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                          }`}
                      >
                        <ArrowUp className={`w-3.5 h-3.5 ${userVotes[theory.id] === 'up' ? 'scale-110 stroke-[3px]' : ''}`} />
                        <span className="text-[10px] font-bold">{theory.upvotes + (localTheoryUpdates[theory.id] || 0)}</span>
                      </button>
                    </div>

                    <h4 className={`text-xl md:text-2xl font-black leading-tight tracking-tight multiline-title transition-colors duration-300 ${theory.status === 'debunked' ? 'text-slate-600 line-through decoration-slate-700' : 'text-slate-100 group-hover:text-white'}`}>
                      {theory.title}
                    </h4>

                    <div className="space-y-3">
                      <div className="h-0.5 w-8 bg-red-600/50 group-hover:w-full transition-all duration-700 ease-in-out" />
                      <p className="text-slate-400 text-sm md:text-base line-clamp-3 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                        {theory.content}
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 mt-auto flex items-center justify-between relative z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="flex items-center space-x-2 text-[9px] uppercase tracking-[0.25em] font-black text-slate-600 group-hover:text-red-500 transition-colors">
                      <span>Access File</span>
                      <div className="w-12 h-0.5 bg-current opacity-30 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-500 group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}

              {theories.length === 0 && (
                <div className="col-span-full py-40 text-center space-y-4 opacity-40">
                  <Info className="w-16 h-16 mx-auto text-slate-500" />
                  <p className="text-lg font-light tracking-wide">No intelligence discovered for this narrative cluster yet.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="string-map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <NarrativeMap
                theories={theories}
                showTitle={show.title}
                onSelectTheory={onSelectTheory}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default TheoryGrid;
