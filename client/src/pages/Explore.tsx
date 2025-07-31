
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DemoExplore from '@/components/explore/DemoExplore';
import AdvancedFilters from '@/components/explore/AdvancedFilters';
import LivePuppyGrid from '@/components/explore/LivePuppyGrid';
import FeaturedPosts from '@/components/FeaturedPosts';

// This component has been replaced with DemoExplore and LivePuppyGrid

const Explore = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    breeds: [] as string[],
    ageRange: [0, 10] as [number, number],
    gender: 'all' as 'all' | 'male' | 'female',
    location: '',
    priceRange: [0, 5000] as [number, number],
    sortBy: 'newest' as 'newest' | 'price_low' | 'price_high' | 'verified' | 'popular',
    verifiedOnly: false,
    healthTested: false,
    vaccinated: false,
    keywords: ''
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // For guest users, show demo explore mode
  if (!user) {
    return <DemoExplore />;
  }

  // For authenticated users, show full featured explore with filters
  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Explore Puppies</h1>
      <p className="mb-6">Find your perfect puppy companion from verified breeders</p>
      
      {/* Advanced Filters for authenticated users */}
      <AdvancedFilters 
        onFiltersChange={setFilters}
        className="mb-6"
      />
      
      {/* Live Puppy Grid with real data */}
      <LivePuppyGrid filters={filters} />
      
      {/* Featured Posts Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Featured Posts</h2>
        <FeaturedPosts />
      </div>
    </div>
  );
};

export default Explore;
