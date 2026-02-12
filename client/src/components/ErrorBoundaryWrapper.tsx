import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEBUG = import.meta.env.DEV && false;

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
  onRetry?: () => void;
}

const RouteErrorFallback: React.FC<{ message?: string; onRetry?: () => void }> = ({ 
  message = "This page encountered an error", 
  onRetry 
}) => {
  if (DEBUG) console.debug('[HOME FEED] Error boundary caught:', message);
  
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Home Feed Error
        </h2>
        <p className="text-gray-600 mb-6">
          {message}. The home feed failed to load properly, but you can try again or navigate to a different section.
        </p>
        <div className="space-x-3">
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh Page
          </Button>
          {onRetry && (
            <Button 
              onClick={onRetry}
              variant="default"
            >
              Retry Feed
            </Button>
          )}
          <Button 
            onClick={() => window.location.href = '/explore'}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Explore
          </Button>
        </div>
      </div>
    </div>
  );
};

const ErrorBoundaryWrapper: React.FC<Props> = ({ children, fallbackMessage, onRetry }) => {
  return (
    <ErrorBoundary 
      fallback={<RouteErrorFallback message={fallbackMessage} onRetry={onRetry} />}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryWrapper;