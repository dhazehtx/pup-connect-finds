
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import HomeFeed from '@/components/home/HomeFeed';

const Home = () => {
  const { user, isGuest } = useAuth();

  // If not authenticated and not guest, show the landing page
  if (!user && !isGuest) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 to-blue-100 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect
              <span className="text-blue-600 block">Puppy Companion</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with verified breeders and discover adorable, healthy puppies 
              waiting for their forever homes.
            </p>
          </div>
        </section>
      </div>
    );
  }

  // If authenticated or guest, show the feed
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <HomeFeed />
      </div>
    </div>
  );
};

export default Home;
