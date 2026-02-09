import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  viewAllLink?: string;
  viewAllLabel?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  viewAllLink,
  viewAllLabel = 'View all',
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
            <Icon size={24} />
          </div>
        )}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-zinc-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {viewAllLink && (
        <button
          onClick={() => navigate(viewAllLink)}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-200 group"
        >
          <span>{viewAllLabel}</span>
          <ChevronRight
            size={16}
            className="transform group-hover:translate-x-1 transition-transform duration-200"
          />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
