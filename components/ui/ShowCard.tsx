import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Show } from '../../types';

interface ShowCardProps {
  show: Show;
  variant?: 'default' | 'compact';
  index?: number;
}

const ShowCard: React.FC<ShowCardProps> = ({ show, variant = 'default', index = 0 }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/hub/${show.type}/${show.id}`);
  };

  // Get proper TMDB image URL
  const getPosterUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const posterUrl = getPosterUrl(show.posterPath);

  // Type badge color mapping
  const typeColors = {
    movie: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    tv: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    anime: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    manga: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  const typeLabel = {
    movie: 'Movie',
    tv: 'TV',
    anime: 'Anime',
    manga: 'Manga',
  };

  if (variant === 'compact') {
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 border border-white/5 hover:border-white/10 hover:bg-zinc-900 transition-all duration-200 cursor-pointer group animate-entrance"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-zinc-800">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={show.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              🎬
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate group-hover:text-red-400 transition-colors">
            {show.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {show.releaseDate && (
              <span className="text-xs text-zinc-500">
                {new Date(show.releaseDate).getFullYear()}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${typeColors[show.type]}`}>
              {typeLabel[show.type]}
            </span>
          </div>
        </div>
        {show.voteAverage && (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={14} fill="currentColor" />
            <span className="text-sm font-semibold">{show.voteAverage.toFixed(1)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer animate-entrance"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 netflix-card">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={show.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎬
          </div>
        )}

        {/* Type badge - top left */}
        <div className="absolute top-2 left-2 z-10">
          <span className={`px-2 py-1 rounded text-xs font-semibold border backdrop-blur-sm ${typeColors[show.type]}`}>
            {typeLabel[show.type]}
          </span>
        </div>

        {/* Rating badge - top right */}
        {show.voteAverage && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/10">
            <Star size={12} fill="#facc15" className="text-yellow-400" />
            <span className="text-xs font-semibold text-white">{show.voteAverage.toFixed(1)}</span>
          </div>
        )}

        {/* Gradient overlay with overview - visible on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
          <p className="text-xs text-zinc-300 line-clamp-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            {show.overview}
          </p>
        </div>
      </div>

      {/* Title and year below card */}
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-red-400 transition-colors">
          {show.title}
        </h3>
        {show.releaseDate && (
          <p className="text-xs text-zinc-500">
            {new Date(show.releaseDate).getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ShowCard;
