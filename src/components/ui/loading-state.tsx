
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  variant?: 'card' | 'inline' | 'fullscreen';
}

const LoadingState = ({ message = 'Loading...', variant = 'inline' }: LoadingStateProps) => {
  const LoadingContent = () => (
    <div className="flex items-center justify-center gap-3 py-8">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-gray-600">{message}</span>
    </div>
  );

  if (variant === 'card') {
    return (
      <Card>
        <CardContent>
          <LoadingContent />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

export default LoadingState;
