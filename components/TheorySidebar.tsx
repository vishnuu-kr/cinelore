
import React from 'react';
import { Theory } from '../types';
import { X, ExternalLink, ArrowUp, User, Zap, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommentSection from './forum/CommentSection';
import { getFullBackdropUrl } from '../services/tmdbService';

import { createPortal } from 'react-dom';

interface TheorySidebarProps {
  showTitle: string;
  theory: Theory | null;
  onClose: () => void;
  isOpen: boolean;
  onAskAI: () => void;
  backdropPath?: string;
  themeColor?: string;
}

const TheorySidebar: React.FC<TheorySidebarProps> = ({ showTitle, theory, onClose, isOpen, onAskAI, backdropPath, themeColor }) => {
  const [activeTab, setActiveTab] = React.useState<'discussion' | 'enhance'>('discussion');
  const [enhancementText, setEnhancementText] = React.useState('');
  const [fullContent, setFullContent] = React.useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = React.useState(false);


  if (!theory || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-[#0B0C10]/95"
        style={{
          background: `radial-gradient(circle at top right, ${themeColor || '#E81313'}15, #0B0C10)`
        }}
      >
        {/* Dynamic Backdrop Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {backdropPath && (
            <img
              src={getFullBackdropUrl(backdropPath)}
              alt=""
              className="w-full h-full object-cover opacity-40 blur-sm scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C10]/60 via-[#0B0C10]/80 to-[#0B0C10]" />
        </div>

        {/* Premium Navigation Header */}
        <div className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between px-8 md:px-16 py-8 bg-gradient-to-b from-[#0B0C10] via-[#0B0C10] to-transparent pointer-events-none">
          <button
            onClick={onClose}
            className="group pointer-events-auto flex items-center gap-3 pl-2 pr-6 py-3 rounded-full bg-white text-black hover:bg-slate-200 border border-white/20 transition-all duration-300 z-[200] hover:scale-105"
          >
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-white text-black transition-colors">
              <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] transition-all">
              <span className="md:hidden">Close</span>
              <span className="hidden md:inline">Close Intelligence</span>
            </span>
          </button>

          {/* Node Indicator */}
          <div className="hidden md:flex flex-col items-end pointer-events-auto opacity-50 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                Secure Node
              </span>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor || '#E81313' }} />
            </div>
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-1">
              ID: {theory.id.slice(0, 8)}...
            </span>
          </div>
        </div>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden pt-24">

          {/* Main Content Area - Optimized Typography */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-16 lg:px-24 pb-32 scroll-smooth relative">
            <div className="max-w-2xl mx-auto relative z-10">
              <div className="space-y-8 mb-8">
                {/* Breadcrumb */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mb-8"
                >
                  <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {showTitle}
                  </span>
                  <div className="w-px h-3 bg-white/10" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Theory Archive
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
                >
                  {theory.title}
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center flex-wrap gap-6 py-6 border-y border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/5">
                      <User className="w-4 h-4 text-white/70" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Investigator</span>
                      <span className="text-xs font-bold text-white tracking-wide">u/{typeof theory.author === 'object' ? theory.author.username : theory.author}</span>
                    </div>
                  </div>

                  <div className="w-px h-8 bg-white/10 hidden sm:block" />

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/5">
                      <ArrowUp className="w-4 h-4 text-white/70" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Credibility</span>
                      <span className="text-xs font-bold text-white tracking-wide">{theory.upvotes} Points</span>
                    </div>
                  </div>

                  <button
                    onClick={onAskAI}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-full transition-all group ml-auto"
                  >
                    <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verify Logic</span>
                  </button>
                </motion.div>

              </div>
              <div className="space-y-6">

                {/* Media Embed Area */}
                {theory.source === 'youtube' && theory.video_url && (
                  <div className="rounded-lg overflow-hidden border border-white/10 aspect-video relative group mb-12">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${theory.video_url.split('v=')[1]?.split('&')[0]}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0"
                    ></iframe>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="prose prose-invert max-w-none"
                >
                  <p className="text-slate-300 text-lg md:text-xl leading-[1.75] font-normal tracking-wide whitespace-pre-wrap selection:bg-red-500/30 selection:text-white">
                    {theory.content}
                  </p>
                </motion.div>

                {/* Enhancements Display - Refined Design */}
                {theory.enhancements && theory.enhancements.length > 0 && (
                  <div className="space-y-12">
                    <div className="flex items-center gap-4">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Collaborations</h3>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>

                    <div className="grid gap-6">
                      {theory.enhancements.map((enh) => (
                        <div key={enh.id} className="group relative bg-white/[0.02] hover:bg-white/[0.04] p-8 rounded-[2rem] border border-white/5 transition-all duration-500">
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${themeColor || '#E81313'}20`, color: themeColor || '#E81313' }}>
                                {enh.author_name.charAt(0)}
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: themeColor || '#E81313' }}>{enh.author_name}</span>
                            </div>
                            <span className="text-[10px] text-slate-600 font-mono italic">{new Date(enh.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-400 font-light leading-relaxed text-sm group-hover:text-slate-200 transition-colors">{enh.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interaction Side Panel - Focused and Minimal */}
          <motion.div
            initial="collapsed"
            whileHover="expanded"
            variants={{
              collapsed: { width: "60px", opacity: 0.8 },
              expanded: { width: "480px", opacity: 1 }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden md:flex flex-col border-l border-white/[0.03] bg-black/20 scroll-smooth relative overflow-hidden flex-none h-full"
          >
            {/* Collapsed Indicator */}
            <div className="absolute inset-y-0 left-0 w-[60px] flex flex-col items-center pt-8 gap-8 pointer-events-none">
              <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 whitespace-nowrap -rotate-90 origin-center translate-y-4">
                Intel Link
              </span>
              <Zap className="w-4 h-4 text-slate-600" />
            </div>

            {/* Content Container - Fades in/out based on expansion */}
            <motion.div
              variants={{
                collapsed: { opacity: 0, x: 20 },
                expanded: { opacity: 1, x: 0 }
              }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full min-w-[480px]" // Min-width prevents layout shift during anim
            >
              <div className="flex-none grid grid-cols-2 px-8 pt-12">
                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === 'discussion' ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  Discussion
                  {activeTab === 'discussion' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-12 h-0.5" style={{ backgroundColor: themeColor || '#E81313' }} />}
                </button>
                <button
                  onClick={() => setActiveTab('enhance')}
                  className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === 'enhance' ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  Enhance
                  {activeTab === 'enhance' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-12 h-0.5" style={{ backgroundColor: themeColor || '#E81313' }} />}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                {activeTab === 'discussion' ? (
                  <CommentSection theoryId={theory.id} />
                ) : (
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-white flex items-center gap-3">
                        <Zap className="w-5 h-5" style={{ color: themeColor || '#E81313' }} />
                        Contribute Intel
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed font-light">
                        Expand this theory with evidence, counter-arguments, or refined details.
                      </p>
                    </div>

                    <div className="space-y-8">
                      <div className="p-6 rounded-2xl bg-red-900/10 border border-red-500/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <div className="relative z-10">
                          <h4 className="text-lg font-bold text-red-500 flex items-center gap-3 mb-2">
                            <Zap className="w-5 h-5" />
                            CLASSIFIED INTEL INJECTION
                          </h4>
                          <p className="text-red-200/60 text-xs leading-relaxed font-mono">
                            WARNING: Providing false signals will result in immediate node isolation. Verify all sources before propagation.
                          </p>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-900 rounded-[2rem] opacity-20 group-focus-within:opacity-50 transition duration-500 blur" />
                        <div className="relative bg-[#0B0C10] rounded-[2rem] p-1">
                          <textarea
                            value={enhancementText}
                            onChange={(e) => setEnhancementText(e.target.value)}
                            className="w-full h-80 bg-transparent border-none rounded-[1.8rem] p-8 text-slate-300 focus:outline-none focus:ring-0 transition-all resize-none text-base leading-relaxed placeholder:text-slate-700 font-mono"
                            placeholder="> Initiate data stream..."
                            spellCheck={false}
                          />
                          <div className="absolute bottom-6 right-8 text-[10px] font-bold text-slate-700 uppercase tracking-widest pointer-events-none">
                            {enhancementText.length} Bytes
                          </div>
                        </div>
                      </div>

                      <button
                        className="w-full py-5 text-white text-xs font-black uppercase tracking-[0.4em] rounded-xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        style={{
                          background: !enhancementText.trim() ? '#1a1a1a' : `linear-gradient(135deg, ${themeColor || '#E01414'}, #8a0c0c)`,
                          boxShadow: !enhancementText.trim() ? 'none' : `0 20px 40px -10px ${themeColor || '#E01414'}66`
                        }}
                        disabled={!enhancementText.trim()}
                        onClick={async () => {
                          const { data } = await import('../services/mockForumService').then(m => m.mockForumService.addEnhancement(theory.id, enhancementText, 'user-123'));
                          if (data) {
                            if (!theory.enhancements) theory.enhancements = [];
                            theory.enhancements.push(data);
                            setEnhancementText('');
                            setActiveTab('discussion');
                          }
                        }}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {enhancementText.trim() && <Zap className="w-4 h-4 animate-pulse" />}
                          Submit Intelligence
                        </span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Mobile Fallback (Non-collapsible for simplicity, or we can make it a tap-to-expand drawer) */}
          <div className="md:hidden w-full border-t border-white/[0.03] bg-black/20 flex flex-col">
            <div className="flex-none grid grid-cols-2 px-8 pt-12">
              <button
                onClick={() => setActiveTab('discussion')}
                className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === 'discussion' ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
              >
                Discussion
                {activeTab === 'discussion' && <motion.div layoutId="tab-underline-mobile" className="absolute bottom-0 left-0 right-12 h-0.5" style={{ backgroundColor: themeColor || '#E81313' }} />}
              </button>
              <button
                onClick={() => setActiveTab('enhance')}
                className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === 'enhance' ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
              >
                Enhance
                {activeTab === 'enhance' && <motion.div layoutId="tab-underline-mobile" className="absolute bottom-0 left-0 right-12 h-0.5" style={{ backgroundColor: themeColor || '#E81313' }} />}
              </button>
            </div>
            <div className="h-96 overflow-y-auto px-8 pb-12">
              {activeTab === 'discussion' ? (
                <CommentSection theoryId={theory.id} />
              ) : (
                <div className="text-slate-500 text-xs py-8 text-center italic">Enhancements available on desktop secure terminal.</div>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default TheorySidebar;


