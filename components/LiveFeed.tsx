
import React, { useEffect, useState } from 'react';
import { Theory } from '../types';
import { fetchHotTheories } from '../services/redditService';
import { Zap, ArrowUpRight } from 'lucide-react';

const LiveFeed: React.FC = () => {
  const [feed, setFeed] = useState<Theory[]>([]);

  useEffect(() => {
    fetchHotTheories().then(setFeed);
  }, []);

  if (feed.length === 0) return null;

  return (
    <div className="w-full bg-[#0B0C10]/90 backdrop-blur-md border-b border-white/5 py-2 overflow-hidden sticky top-20 z-[90]">
      <div className="container mx-auto px-6 flex items-center">
        <div className="flex items-center space-x-2 shrink-0 mr-8 z-10 bg-[#0B0C10]/90 pr-4 relative">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Live Intel</span>
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-r from-transparent to-[#0B0C10]/90"></div>
        </div>

        <div className="marquee mask-image-linear-to-r">
          <div className="marquee-content space-x-12">
            {feed.map(t => (
              <div
                key={t.id}
                className="text-xs font-medium text-slate-400 hover:text-white transition-colors whitespace-nowrap flex items-center space-x-2 group cursor-default"
              >
                <span className="opacity-40 text-[10px]">u/{t.author}</span>
                <span className="text-white/80 group-hover:text-white max-w-96 truncate">{t.title}</span>
              </div>
            ))}
          </div>
          <div className="marquee-content space-x-12" aria-hidden="true">
            {feed.map(t => (
              <div
                key={`${t.id}-dup`}
                className="text-xs font-medium text-slate-400 hover:text-white transition-colors whitespace-nowrap flex items-center space-x-2 group cursor-default"
              >
                <span className="opacity-40 text-[10px]">u/{t.author}</span>
                <span className="text-white/80 group-hover:text-white max-w-96 truncate">{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveFeed;
