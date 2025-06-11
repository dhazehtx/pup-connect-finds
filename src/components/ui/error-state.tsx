
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  variant?: 'card' | 'inline' | 'minimal' | 'detailed';
  onRetry?: () => void;
  retryText?: string;
  error?: Error;
}

const ErrorState = ({ 
  title = 'Something went wrong', 
  message = 'Please try again later',
  variant = 'inline',
  onRetry,
  retryText = 'Try Again',
  error
}: ErrorStateProps) => {
  const ErrorContent = () => (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <AlertCircle className="h-8 w-8 text-red-500" />
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-1">{message}</p>
        {variant === 'detailed' && error && (
          <details className="mt-2 text-xs text-gray-500">
            <summary className="cursor-pointer">Technical details</summary>
            <pre className="mt-2 text-left bg-gray-100 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          {retryText}
        </Button>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card>
        <CardContent>
          <ErrorContent />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="ghost" size="sm" className="mt-2">
            {retryText}
          </Button>
        )}
      </div>
    );
  }

  return <ErrorContent />;
};

export default ErrorState;
