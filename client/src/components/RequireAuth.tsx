import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingPage } from '@/components/ui/loading';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Debug logging - throttled to avoid excessive re-renders
  useEffect(() => {
    console.log('[REQUIRE AUTH] Auth state changed:', { 
      user: !!user, 
      loading, 
      pathname: location.pathname,
      timestamp: Date.now()
    });
  }, [user, loading, location.pathname]);

  // Wait until AuthContext finishes its first check
  if (loading) {
    console.log('[REQUIRE AUTH] Still loading, showing auth loading page');
    return <LoadingPage message="Authenticating..." />;
  }

  // Not signed-in → go to greeting and remember where they tried to go
  if (!user) {
    console.log('[REQUIRE AUTH] No user, redirecting to greeting from:', location.pathname);
    return <Navigate to="/greeting" state={{ from: location }} replace />;
  }

  // Signed-in → render the protected page
  console.log('[REQUIRE AUTH] User authenticated, rendering protected content for:', location.pathname);
  return children;
}