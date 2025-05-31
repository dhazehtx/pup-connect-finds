
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import RippleButton from '@/components/ui/ripple-button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed';
  error?: Error;
}

const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content.',
  onRetry,
  retryText = 'Try again',
  className,
  variant = 'default',
  error
}: ErrorStateProps) => {
  const showDetails = variant === 'detailed' && error;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      variant === 'minimal' ? 'py-8' : 'py-16',
      className
    )}>
      <div className={cn(
        'rounded-full mb-4 flex items-center justify-center',
        variant === 'minimal' ? 'w-12 h-12 bg-red-50' : 'w-16 h-16 bg-red-100'
      )}>
        <AlertCircle 
          className={cn(
            'text-red-500',
            variant === 'minimal' ? 'w-6 h-6' : 'w-8 h-8'
          )} 
        />
      </div>

      <div className="max-w-md mx-auto">
        <h3 className={cn(
          'font-semibold text-gray-900 mb-2',
          variant === 'minimal' ? 'text-lg' : 'text-xl'
        )}>
          {title}
        </h3>
        
        <p className={cn(
          'text-gray-600 mb-6',
          variant === 'minimal' ? 'text-sm' : 'text-base'
        )}>
          {message}
        </p>

        {showDetails && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Technical details
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded border text-xs font-mono text-gray-700">
              {error.message}
            </div>
          </details>
        )}

        {onRetry && (
          <RippleButton
            onClick={onRetry}
            className="bg-royal-blue text-white hover:bg-blue-600"
            size={variant === 'minimal' ? 'sm' : 'default'}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryText}
          </RippleButton>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
