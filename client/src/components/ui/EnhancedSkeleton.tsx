import React from 'react';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface ListingGridSkeletonProps {
  count?: number;
  className?: string;
}

export const ListingGridSkeleton: React.FC<ListingGridSkeletonProps> = ({
  count = 8,
  className
}) => (
  <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

interface MessageListSkeletonProps {
  count?: number;
  className?: string;
}

export const MessageListSkeleton: React.FC<MessageListSkeletonProps> = ({
  count = 6,
  className
}) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

interface ProfileSkeletonProps {
  className?: string;
}

export const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({ className }) => (
  <div className={cn('space-y-6 p-4', className)}>
    {/* Profile header */}
    <div className="flex items-center space-x-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center space-y-2">
          <Skeleton className="h-6 w-8 mx-auto" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
      ))}
    </div>

    {/* Content grid */}
    <ListingGridSkeleton count={6} />
  </div>
);

interface SearchFilterSkeletonProps {
  className?: string;
}

export const SearchFilterSkeleton: React.FC<SearchFilterSkeletonProps> = ({ className }) => (
  <div className={cn('space-y-4', className)}>
    <Skeleton className="h-12 w-full rounded-lg" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-full" />
      <Skeleton className="h-8 w-16 rounded-full" />
    </div>
  </div>
);