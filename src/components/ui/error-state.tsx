
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  variant?: 'card' | 'inline' | 'minimal';
  onRetry?: () => void;
}

const ErrorState = ({ 
  title = 'Something went wrong', 
  message = 'Please try again later',
  variant = 'inline',
  onRetry 
}: ErrorStateProps) => {
  const ErrorContent = () => (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <AlertCircle className="h-8 w-8 text-red-500" />
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Try Again
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
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return <ErrorContent />;
};

export default ErrorState;
