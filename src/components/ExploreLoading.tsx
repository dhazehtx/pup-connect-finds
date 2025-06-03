
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ExploreLoading = () => {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4 space-y-6">
        {/* Search Bar Skeleton */}
        <div className="relative">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* Popular Breeds Skeleton */}
        <div>
          <Skeleton className="h-6 w-32 mb-3" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>

        {/* Quick Filters Skeleton */}
        <div>
          <Skeleton className="h-6 w-28 mb-3" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Main Search Bar Skeleton */}
        <Skeleton className="h-10 w-full rounded-lg" />

        {/* Results Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>

        {/* Listings Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <Skeleton className="w-full h-48" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreLoading;
