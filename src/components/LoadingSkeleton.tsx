
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingSkeletonProps {
  viewMode: 'grid' | 'list';
  count: number;
}

const LoadingSkeleton = ({ viewMode, count }: LoadingSkeletonProps) => {
  const skeletonCards = Array.from({ length: count }, (_, i) => (
    <Card key={i} className="overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse"></div>
      <CardContent className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-gray-200 rounded flex-1 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded flex-1 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  ));

  if (viewMode === 'list') {
    return <div className="space-y-4">{skeletonCards}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {skeletonCards}
    </div>
  );
};

export default LoadingSkeleton;
