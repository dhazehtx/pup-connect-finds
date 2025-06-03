
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'card';
}

const LoadingState = ({
  message = 'Loading...',
  className,
  size = 'md',
  variant = 'default'
}: LoadingStateProps) => {
  const sizeConfig = {
    sm: { spinner: 'w-4 h-4', text: 'text-sm' },
    md: { spinner: 'w-6 h-6', text: 'text-base' },
    lg: { spinner: 'w-8 h-8', text: 'text-lg' }
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className={cn('animate-spin', sizeConfig[size].spinner)} />
        <span className={cn('text-gray-600', sizeConfig[size].text)}>{message}</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('bg-white rounded-lg border p-8', className)}>
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className={cn('animate-spin mb-4 text-blue-500', sizeConfig[size].spinner)} />
          <p className={cn('text-gray-600', sizeConfig[size].text)}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-8', className)}>
      <Loader2 className={cn('animate-spin mb-4 text-blue-500', sizeConfig[size].spinner)} />
      <p className={cn('text-gray-600', sizeConfig[size].text)}>{message}</p>
    </div>
  );
};

export default LoadingState;
