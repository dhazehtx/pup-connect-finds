
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SkeletonLoader from '@/components/ui/skeleton-loader';

const ListingsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-blue-200 shadow-sm">
          <div className="relative">
            <SkeletonLoader variant="image" />
          </div>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <SkeletonLoader className="h-6 w-3/4 mb-2" />
                <div className="flex items-center gap-2">
                  <SkeletonLoader className="h-5 w-16" />
                  <SkeletonLoader className="h-5 w-20" />
                </div>
              </div>
              <SkeletonLoader className="h-4 w-1/2" />
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <SkeletonLoader variant="avatar" className="w-6 h-6" />
                  <SkeletonLoader className="h-4 w-20" />
                </div>
                <SkeletonLoader className="h-4 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ListingsSkeleton;
