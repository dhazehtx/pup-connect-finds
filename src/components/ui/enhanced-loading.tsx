
import React from 'react';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
  fullScreen?: boolean;
}

const EnhancedLoading = ({ 
  size = 'md', 
  text, 
  variant = 'spinner',
  className,
  fullScreen = false
}: EnhancedLoadingProps) => {
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

  const LoadingSpinner = () => (
    <Loader className={cn('animate-spin text-royal-blue', sizeClasses[size])} />
  );

  const LoadingDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-royal-blue rounded-full animate-pulse',
            size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );

  const LoadingPulse = () => (
    <div className={cn(
      'bg-royal-blue rounded-full animate-pulse',
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
          'text-gray-600 animate-pulse font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default EnhancedLoading;
