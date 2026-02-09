
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Show } from '../types';
import { searchShows, getFullPosterUrl } from '../services/tmdbService';
import { searchManga } from '../services/mangaService';
import { Search as SearchIcon, ArrowUpRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchProps {
  onSelect: (show: Show) => void;
}

const Search: React.FC<SearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Show[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Simplified pagination for combined search (just page 1 for now or endless scroll if complex)
  // Implementing combined pagination is tricky, so we'll stick to simple combined search for page 1 first
  // or parallel requests.
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    setIsSearching(true);

    // Run both searches in parallel
    const [tmdbData, mangaData] = await Promise.all([
      searchShows(searchQuery, 1),
      searchManga(searchQuery)
    ]);

    // Combine and shuffle/sort? Just merge for now.
    const combined = [...tmdbData.results, ...mangaData];

    // Sort by popularity or relevance if possible, or just interleave? 
    // TMDB results are usually better sorted. Jikan relevance is okay.
    // Let's just use them as is.

    setResults(combined);
    setIsSearching(false);
    setShowDropdown(true);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      performSearch(query);
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query, performSearch]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Minimal Search Container */}
      <div className="relative rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus-within:border-zinc-600 transition-colors">
        <div className="flex items-center px-5">
          <SearchIcon className="w-5 h-5 text-zinc-500 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shows, movies, anime..."
            className="w-full bg-transparent text-white text-base py-4 outline-none placeholder-zinc-600"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 text-zinc-500 animate-spin ml-2" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-50"
          >
            <div className="p-1 max-h-[28rem] overflow-y-auto">
              {results.map((show) => (
                <button
                  key={`${show.type}-${show.id}`}
                  onClick={() => {
                    onSelect(show);
                    setShowDropdown(false);
                    setQuery('');
                  }}
                  className="w-full flex items-center p-3 hover:bg-zinc-800 rounded-lg transition-colors text-left group/item gap-3"
                >
                  <div className="relative shrink-0">
                    <img
                      src={getFullPosterUrl(show.posterPath)}
                      alt={show.title}
                      className="w-12 h-16 object-cover rounded bg-zinc-800"
                      onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=200")}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-white font-medium text-sm truncate group-hover/item:text-red-500 transition-colors">{show.title}</h3>
                    <p className="text-zinc-500 text-xs line-clamp-1 mt-0.5">{show.overview}</p>
                  </div>
                  <span className="text-[10px] text-zinc-600 uppercase font-semibold">{show.type}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;

