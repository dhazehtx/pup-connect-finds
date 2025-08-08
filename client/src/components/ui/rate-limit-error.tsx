import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface RateLimitErrorProps {
  error: {
    error: string;
    message: string;
    retryAfter?: number;
  };
  onRetry?: () => void;
}

export const RateLimitError: React.FC<RateLimitErrorProps> = ({ error, onRetry }) => {
  const [countdown, setCountdown] = React.useState(error.retryAfter || 0);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 
      ? `${minutes}m ${remainingSeconds}s` 
      : `${remainingSeconds}s`;
  };

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">Rate Limit Exceeded</AlertTitle>
      <AlertDescription className="text-amber-800">
        <div className="space-y-2">
          <p>{error.message}</p>
          {countdown > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3 w-3" />
              <span>Try again in {formatTime(countdown)}</span>
            </div>
          )}
          {countdown === 0 && onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Custom hook for handling rate limit errors
export const useRateLimitHandler = () => {
  const handleRateLimitError = React.useCallback((error: any) => {
    if (error?.status === 429) {
      const retryAfter = parseInt(error.headers?.['retry-after'] || '0');
      return {
        error: error.data?.error || 'Rate limit exceeded',
        message: error.data?.message || 'Please try again later',
        retryAfter: retryAfter
      };
    }
    return null;
  }, []);

  return { handleRateLimitError };
};