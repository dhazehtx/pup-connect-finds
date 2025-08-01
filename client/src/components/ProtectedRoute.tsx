import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isGuest } = useAuth();

  console.log('[PROTECTED ROUTE] Guard check:', {
    hasUser: !!user,
    loading,
    isGuest,
    shouldRedirect: !loading && !user && !isGuest
  });

  // Show loading while checking auth state
  if (loading) {
    console.log('[PROTECTED ROUTE] Showing loading - auth is resolving');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // HARDEN GUARD - Redirect unauthenticated users to the greeting page (landing page)
  if (!user && !isGuest) {
    console.log('[NAV GUARD] Executing redirect - protected route requires auth, redirecting to /greeting');
    return <Navigate to="/greeting" replace />;
  }

  console.log('[PROTECTED ROUTE] Auth verified - rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;