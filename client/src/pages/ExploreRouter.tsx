import React, { useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import ExploreGuest from '@/pages/ExploreGuest';
import ExploreAdvanced from '@/pages/ExploreAdvanced';

const DEBUG = import.meta.env.DEV && false;

export default function ExploreRouter() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 2. AUDIT AND FIX GUARD LOGIC - Stable user identity
  const stableUserId = useMemo(() => user?.id || null, [user?.id]);
  
  if (DEBUG) console.debug('[EXPLORE ROUTER] Router render', {
    userId: stableUserId,
    hasUser: !!user,
    loading,
    pathname: location.pathname,
    timestamp: Date.now()
  });

  // Keep the document title accurate for /explore (was stale from the prior page).
  useEffect(() => {
    document.title = 'Explore — PAWS';
  }, []);

  // Auth state change tracking with stable dependencies
  useEffect(() => {
    if (DEBUG) console.debug('[EXPLORE ROUTER] Router state changed', {
      userId: stableUserId, 
      hasUser: !!user, 
      loading,
      pathname: location.pathname
    });
  }, [stableUserId, !!user, loading, location.pathname]);

  // 3. FIX INFINITE RE-RENDERS - Proper loading and auth checks
  if (loading) {
    if (DEBUG) console.debug('[EXPLORE ROUTER] Still loading, showing loading state');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading explore...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    if (DEBUG) console.debug('[EXPLORE ROUTER] No user, showing guest explore');
    return <ExploreGuest />;
  }
  
  if (DEBUG) console.debug('[EXPLORE ROUTER] User authenticated, showing advanced explore');
  return <ExploreAdvanced />;
}