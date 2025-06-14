
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  variant?: 'minimal' | 'detailed' | 'fullscreen';
  className?: string;
  error?: Error;
}

const ErrorState = ({
  title = 'Something went wrong',
  message = 'Please try again later',
  onRetry,
  retryText = 'Try again',
  variant = 'minimal',
  className,
  error
}: ErrorStateProps) => {
  const ErrorContent = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{message}</p>
      {variant === 'detailed' && error && (
        <details className="text-left bg-gray-50 p-4 rounded-lg mb-4">
          <summary className="font-medium text-gray-700 cursor-pointer">Error details</summary>
          <pre className="text-xs text-gray-600 mt-2 overflow-auto">{error.message}</pre>
        </details>
      )}
      {onRetry && (
        <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryText}
        </Button>
      )}
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className={cn("min-h-screen flex items-center justify-center bg-gray-50", className)}>
        <div className="max-w-md w-full px-4">
          <ErrorContent />
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={className}>
        <ErrorContent />
      </div>
    );
  }

  return (
    <Card className={cn("border-red-200 shadow-sm", className)}>
      <CardContent>
        <ErrorContent />
      </CardContent>
    </Card>
  );
};

export default ErrorState;
