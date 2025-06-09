
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowGuest?: boolean;
  guestMessage?: string;
}

const ProtectedRoute = ({ children, allowGuest = false, guestMessage }: ProtectedRouteProps) => {
  const { user, loading, isGuest } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSkeleton viewMode="grid" count={3} />;
  }

  // If route allows guests and user is a guest, show content
  if (allowGuest && isGuest) {
    return <>{children}</>;
  }

  // If user is authenticated, show content
  if (user) {
    return <>{children}</>;
  }

  // If route allows guests but user is not authenticated at all, redirect to auth
  if (allowGuest && !isGuest) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // For protected routes, show auth prompt if user is guest
  if (isGuest && !allowGuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {guestMessage || "This feature requires a MY PUP account to continue."}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="w-full"
              >
                Sign In to Continue
              </Button>
              <Button 
                onClick={() => window.location.href = '/auth'}
                variant="outline"
                className="w-full"
              >
                Create Account
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="ghost"
                className="w-full text-gray-500"
              >
                Back to Browse
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect unauthenticated users to auth page
  return <Navigate to="/auth" state={{ from: location }} replace />;
};

export default ProtectedRoute;
