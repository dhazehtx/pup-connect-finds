import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingPage } from '@/components/ui/loading';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. INSTRUMENT - Navigation guard activity logging
  console.log('[REQUIRE AUTH] Guard check:', { 
    userId: user?.id,
    hasUser: !!user, 
    loading, 
    pathname: location.pathname,
    timestamp: Date.now()
  });

  // Stable user identity to prevent unnecessary re-evaluations
  const stableUserId = useMemo(() => user?.id || null, [user?.id]);
  
  // Auth state change detection
  useEffect(() => {
    console.log('[REQUIRE AUTH] Auth state changed:', { 
      userId: stableUserId,
      hasUser: !!user, 
      loading, 
      pathname: location.pathname,
    });
  }, [stableUserId, !!user, loading, location.pathname]);

  // 2. DIAGNOSE - Guard redirect safety
  const shouldRedirect = useMemo(() => {
    const result = !loading && !user;
    console.log('[REQUIRE AUTH] Redirect decision:', {
      shouldRedirect: result,
      loading,
      hasUser: !!user,
      pathname: location.pathname
    });
    return result;
  }, [loading, !!user, location.pathname]);

  // Wait until AuthContext finishes its first check
  if (loading) {
    console.log('[REQUIRE AUTH] Still loading, showing auth loading page');
    return <LoadingPage message="Checking authentication..." />;
  }

  // 3. REFACTOR - Guard redirects safely, only when truly needed
  if (shouldRedirect) {
    console.log('[REQUIRE AUTH] User not authenticated, redirecting to greeting from:', location.pathname);
    return <Navigate to="/greeting" replace />;
  }

  console.log('[REQUIRE AUTH] User authenticated, rendering protected content for:', location.pathname);
  return children;
}