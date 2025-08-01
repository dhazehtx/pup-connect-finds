
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import HomeFeed from '@/components/home/HomeFeed';

const HomeFeedPage = () => {
  const { user, isGuest } = useAuth();

  // Debug logging - throttled to avoid excessive re-renders
  useEffect(() => {
    console.log('[HOME FEED PAGE] Component state changed', { user: !!user, isGuest });
  }, [user, isGuest]);

  if (!user && !isGuest) {
    console.log('[HOME FEED PAGE] No user and not guest, returning null');
    return null; // This should be handled by ProtectedRoute
  }

  console.log('[HOME FEED PAGE] Rendering home feed content');
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <HomeFeed />
      </div>
    </div>
  );
};

export default HomeFeedPage;
