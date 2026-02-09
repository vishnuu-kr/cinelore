import React from 'react';

interface SkeletonGridProps {
  count?: number;
}

const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-entrance"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* Card placeholder */}
          <div className="aspect-[2/3] skeleton-card" />
          
          {/* Text line placeholders */}
          <div className="mt-3 space-y-2">
            <div className="skeleton-text w-full" />
            <div className="skeleton-text w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonGrid;
