
import React from 'react';
import { AlertTriangle, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ProfileErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

const ProfileErrorFallback: React.FC<ProfileErrorFallbackProps> = ({ error, onRetry }) => (
  <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center p-4">
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-orange-600" />
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Profile Error
        </CardTitle>
        <p className="text-sm text-gray-600">
          We couldn't load the profile information. Please try again.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {process.env.NODE_ENV === 'development' && error && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-700 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={onRetry || (() => window.location.reload())}
            className="flex-1"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button 
            onClick={() => window.history.back()}
            className="flex-1"
          >
            Go Back
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

interface ProfileErrorBoundaryProps {
  children: React.ReactNode;
}

export const ProfileErrorBoundary: React.FC<ProfileErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={<ProfileErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Profile error:', error, errorInfo);
        // You could send this to an analytics service
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ProfileErrorBoundary;
