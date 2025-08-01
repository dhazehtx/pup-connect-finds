
import React, { useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeFeed from '@/components/home/HomeFeed';

const HomeFeedPage = () => {
  const { user, loading, isGuest } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. INSTRUMENT & DETECT - Focused console logging
  console.log('[HOME FEED PAGE] Render cycle start:', {
    userId: user?.id,
    hasUser: !!user,
    loading,
    isGuest,
    pathname: location.pathname,
    timestamp: Date.now()
  });

  // Memoize stable user identity to prevent unnecessary re-renders
  const stableUserId = useMemo(() => user?.id || null, [user?.id]);
  const stableAuthState = useMemo(() => ({
    hasUser: !!user,
    loading,
    isGuest
  }), [!!user, loading, isGuest]);

  // Auth state change detection
  useEffect(() => {
    console.log('[HOME FEED PAGE] Auth state changed:', {
      userId: stableUserId,
      hasUser: stableAuthState.hasUser,
      loading: stableAuthState.loading,
      isGuest: stableAuthState.isGuest,
      pathname: location.pathname
    });
  }, [stableUserId, stableAuthState.hasUser, stableAuthState.loading, stableAuthState.isGuest, location.pathname]);

  // Navigation guard with logging
  useEffect(() => {
    console.log('[HOME FEED PAGE] Navigation guard check:', {
      loading,
      hasUser: !!user,
      isGuest,
      pathname: location.pathname,
      shouldRedirect: !loading && !user && !isGuest
    });
    
    // Only redirect if auth check is complete and user is not authenticated/guest
    if (!loading && !user && !isGuest) {
      console.log('[HOME FEED PAGE] Redirecting unauthenticated user to greeting');
      navigate('/greeting', { replace: true });
      return;
    }
  }, [loading, user, isGuest, location.pathname, navigate]);

  // Mount/unmount detection
  useEffect(() => {
    console.log('[HOME FEED PAGE] Component mounted on:', location.pathname);
    return () => {
      console.log('[HOME FEED PAGE] Component unmounting from:', location.pathname);
    };
  }, [location.pathname]);

  // EARLY RETURN: Show loading spinner while auth is resolving
  if (loading) {
    console.log('[HOME FEED PAGE] Showing loading spinner - auth is still resolving');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your feed...</p>
        </div>
      </div>
    );
  }

  // Guard against rendering without proper auth
  if (!user && !isGuest) {
    console.log('[HOME FEED PAGE] No auth, returning null (redirect should have happened)');
    return null;
  }

  console.log('[HOME FEED PAGE] Auth settled - rendering full home feed for:', { userId: user?.id, isGuest });
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <HomeFeed />
      </div>
    </div>
  );
};

export default HomeFeedPage;
