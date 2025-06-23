
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/ui/loading-state';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isGuest, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Checking authentication..." />;
  }

  // If user is not authenticated and not in guest mode, show sign-in prompt
  if (!user && !isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-blue-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <LogIn className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in to continue</h2>
            <p className="text-gray-600 mb-6">
              You need to be signed in to access this page.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = `/auth?redirect=${encodeURIComponent(location.pathname)}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Sign In
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
