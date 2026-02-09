import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  // Get proper image URL
  const getImageUrl = () => {
    if (!show.posterPath) return null;
    if (show.posterPath.startsWith('http')) return show.posterPath;
    return `https://image.tmdb.org/t/p/w500${show.posterPath}`;
  };

  const imageUrl = getImageUrl();
  const releaseYear = show.releaseDate ? new Date(show.releaseDate).getFullYear() : null;

  if (variant === 'compact') {
    return (
      <div
        onClick={handleClick}
        className="flex gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer animate-fade-in"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
          {imageUrl ? (
            <img
              src={imageUrl}
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
          <h3 className="font-semibold text-white truncate">{show.title}</h3>
          {releaseYear && (
            <p className="text-sm text-zinc-500 mt-1">{releaseYear}</p>
          )}
          {show.voteAverage && (
            <div className="flex items-center gap-1 mt-2 text-sm text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span>{show.voteAverage.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer animate-entrance"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Poster Card */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 netflix-card">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={show.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎬
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-red-600 text-white text-xs font-semibold uppercase">
          {show.type}
        </div>

        {/* Rating Badge */}
        {show.voteAverage && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm text-white text-xs font-semibold">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            <span>{show.voteAverage.toFixed(1)}</span>
          </div>
        )}

        {/* Gradient Overlay with Overview (visible on hover) */}
        {show.overview && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
            <p className="text-xs text-white line-clamp-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              {show.overview}
            </p>
          </div>
        )}
      </div>

      {/* Title and Year */}
      <div className="mt-3 px-1">
        <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight">
          {show.title}
        </h3>
        {releaseYear && (
          <p className="text-xs text-zinc-500 mt-1">{releaseYear}</p>
        )}
      </div>
    </div>
  );
};

export default ShowCard;
