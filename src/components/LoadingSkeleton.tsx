
import React from 'react';
import EnhancedLoading from '@/components/ui/enhanced-loading';

interface LoadingSkeletonProps {
  viewMode: 'grid' | 'list';
  count?: number;
}

const LoadingSkeleton = ({ viewMode, count = 6 }: LoadingSkeletonProps) => {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-48 h-32 rounded-lg bg-gray-100 flex items-center justify-center">
              <EnhancedLoading size="md" variant="pulse" />
            </div>
            <div className="flex-1 ml-4 space-y-2">
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              <div className="flex gap-2 mt-3">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <EnhancedLoading size="lg" variant="pulse" />
          </div>
          <div className="p-4 space-y-2">
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2 mt-3">
              <div className="h-8 flex-1 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
