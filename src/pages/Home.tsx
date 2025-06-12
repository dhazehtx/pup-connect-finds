
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GuestHero from '@/components/home/GuestHero';
import { Navigate } from 'react-router-dom';

const Home = () => {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to explore page (or implement user feed later)
  if (user) {
    return <Navigate to="/explore" replace />;
  }

  // If user is a guest, redirect to auth page
  if (isGuest) {
    return <Navigate to="/auth" replace />;
  }

  // For non-authenticated users, show the guest hero page
  return <GuestHero />;
};

export default Home;
