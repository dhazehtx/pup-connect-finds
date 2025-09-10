import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingPage } from '@/components/ui/loading';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading, loaded } = useAuth();
  const location = useLocation();

  // 1. INSTRUMENT - Navigation guard activity logging
  console.log('[REQUIRE AUTH] Guard check:', { 
    userId: user?.id,
    hasUser: !!user, 
    loading,
    loaded,
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
      loaded,
      pathname: location.pathname,
    });
  }, [stableUserId, !!user, loading, loaded, location.pathname]);

  // HARDEN GUARD REDIRECT SAFETY - Prevent redundant redirects  
  const shouldRedirect = useMemo(() => {
    // CRITICAL: Don't redirect until auth is fully loaded to prevent false "Session Expired"
    const result = loaded && !loading && !user;
    const currentPath = location.pathname;
    const targetPath = '/greeting';
    const alreadyOnTarget = currentPath === targetPath;
    
    console.log('[REQUIRE AUTH] Redirect decision:', {
      shouldRedirect: result,
      loading,
      loaded,
      hasUser: !!user,
      pathname: currentPath,
      targetPath,
      alreadyOnTarget,
      willSkipRedirect: result && alreadyOnTarget
    });
    
    // Don't redirect if already on target path
    if (result && alreadyOnTarget) {
      console.log('[NAV GUARD] Already on target path (/greeting), skipping redirect');
      return false;
    }
    
    return result;
  }, [loading, loaded, !!user, location.pathname]);

  // Wait until AuthContext finishes its first check - CRITICAL: Wait for loaded flag
  if (loading || !loaded) {
    console.log('[REQUIRE AUTH] Still loading or not loaded, showing auth loading page', { loading, loaded });
    return <LoadingPage message="Checking authentication..." />;
  }

  // EXECUTE REDIRECT - Only when truly needed and not already on target
  if (shouldRedirect) {
    console.log('[NAV GUARD] Executing redirect - user not authenticated, redirecting from', location.pathname, 'to /greeting');
    return <Navigate to="/greeting" replace />;
  }

  console.log('[REQUIRE AUTH] User authenticated, rendering protected content for:', location.pathname);
  return children;
}