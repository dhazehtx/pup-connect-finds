
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'avatar' | 'card' | 'button' | 'image';
  lines?: number;
}

const SkeletonLoader = ({ className, variant = 'text', lines = 1 }: SkeletonLoaderProps) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  const variantClasses = {
    text: 'h-4 w-full',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-48 w-full',
    button: 'h-10 w-24',
    image: 'aspect-square w-full'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variantClasses.text,
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    />
  );
};

export default SkeletonLoader;
