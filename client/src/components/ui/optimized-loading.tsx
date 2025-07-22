
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface OptimizedLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  className?: string;
  fullScreen?: boolean;
  color?: 'primary' | 'secondary' | 'muted';
}

const OptimizedLoading = ({ 
  size = 'md', 
  text, 
  variant = 'spinner',
  className,
  fullScreen = false,
  color = 'primary'
}: OptimizedLoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    muted: 'text-gray-400'
  };

  const LoadingSpinner = () => (
    <Loader2 className={cn('animate-spin', sizeClasses[size], colorClasses[color])} />
  );

  const LoadingDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            colorClasses[color].replace('text-', 'bg-'),
            size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );

  const LoadingPulse = () => (
    <div className={cn(
      'rounded-full animate-pulse',
      colorClasses[color].replace('text-', 'bg-'),
      sizeClasses[size]
    )} />
  );

  const renderLoading = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots />;
      case 'pulse':
        return <LoadingPulse />;
      default:
        return <LoadingSpinner />;
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      className
    )}>
      {renderLoading()}
      {text && (
        <p className={cn(
          'animate-pulse font-medium',
          textSizeClasses[size],
          colorClasses[color]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default OptimizedLoading;
