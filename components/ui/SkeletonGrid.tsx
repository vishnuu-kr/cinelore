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
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* Poster Skeleton */}
          <div className="skeleton-card mb-3"></div>
          
          {/* Title Skeleton */}
          <div className="skeleton-text mb-2"></div>
          
          {/* Year Skeleton */}
          <div className="skeleton-text w-16"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonGrid;
