
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  retryText?: string;
  showHomeButton?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
  error?: Error;
}

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  onGoHome,
  retryText = 'Try Again',
  showHomeButton = true,
  variant = 'default',
  error
}: ErrorStateProps) => {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryText}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
          <p className="text-sm text-gray-600 mt-2">{message}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-red-800 mb-2">Error Details:</h4>
              <p className="text-xs text-red-700 font-mono break-all">{error.message}</p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-700 cursor-pointer">Stack Trace</summary>
                  <pre className="text-xs text-red-700 mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="flex-1" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                {retryText}
              </Button>
            )}
            {showHomeButton && (
              <Button onClick={handleGoHome} className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      <div className="flex gap-3 justify-center">
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryText}
          </Button>
        )}
        {showHomeButton && (
          <Button onClick={handleGoHome}>
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
