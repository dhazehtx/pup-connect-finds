
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ExploreHeader from '@/components/explore/ExploreHeader';
import QuickFiltersBar from '@/components/explore/QuickFiltersBar';
import ExploreListingsGrid from '@/components/explore/ExploreListingsGrid';
import PopularBreeds from '@/components/explore/PopularBreeds';
import AdvancedFiltersPanel from '@/components/explore/AdvancedFiltersPanel';
import { ExploreLoading } from '@/components/ExploreLoading';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import { useListingFilters } from '@/hooks/useListingFilters';
import { useMessaging } from '@/hooks/useMessaging';

const Explore = () => {
  const { user } = useAuth();
  const { startConversation } = useMessaging();
  const { listings, loading, error } = useDogListings();
  const {
    filters,
    updateFilters,
    resetFilters,
    filteredListings,
    hasActiveFilters
  } = useListingFilters(listings);
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const navigate = useNavigate();

  const handleQuickFilterChange = (filterType: string, value: any) => {
    updateFilters({ [filterType]: value });
  };

  const handleAdvancedFilterChange = (newFilters: any) => {
    updateFilters(newFilters);
  };

  const handleContactSeller = async (listing: any) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const conversationId = await startConversation(listing.user_id, listing.id);
      if (conversationId) {
        navigate('/messages');
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <ExploreLoading />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ExploreHeader />
        
        <div className="container mx-auto px-4 py-6">
          <QuickFiltersBar 
            filters={filters}
            onFilterChange={handleQuickFilterChange}
            onShowAdvancedFilters={() => setShowAdvancedFilters(true)}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <PopularBreeds onBreedSelect={(breed) => handleQuickFilterChange('breed', breed)} />
            </div>

            <div className="lg:col-span-3">
              <ExploreListingsGrid 
                listings={filteredListings}
                onContactSeller={handleContactSeller}
              />
            </div>
          </div>
        </div>

        <AdvancedFiltersPanel
          isOpen={showAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
          filters={filters}
          onFiltersChange={handleAdvancedFilterChange}
          onResetFilters={resetFilters}
        />
      </div>
    </Layout>
  );
};

export default Explore;
