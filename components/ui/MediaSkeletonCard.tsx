import React from 'react';
import Skeleton from './Skeleton';

const MediaSkeletonCard: React.FC = () => {
    return (
        <div className="space-y-3">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                <Skeleton className="w-full h-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
};

export default MediaSkeletonCard;
