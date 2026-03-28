import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div 
      className={`animate-pulse bg-surface-light rounded-md ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear'
      }}
    />
  );
};

export const SkeletonRow: React.FC = () => (
  <div className="flex space-x-4 p-4">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2 py-1">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-surface p-6 rounded-2xl border border-border">
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-6 w-16" />
    </div>
    <Skeleton className="h-4 w-1/3 mb-2" />
    <Skeleton className="h-8 w-2/3" />
  </div>
);
