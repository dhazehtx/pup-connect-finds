
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import HomeFeed from '@/components/home/HomeFeed';

const HomeFeedPage = () => {
  const { user, isGuest } = useAuth();

  if (!user && !isGuest) {
    return null; // This should be handled by ProtectedRoute
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <HomeFeed />
      </div>
    </div>
  );
};

export default HomeFeedPage;
