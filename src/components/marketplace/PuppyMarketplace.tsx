
import React from 'react';
import { useDogListings } from '@/hooks/useDogListings';
import ListingCard from '@/components/ListingCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';

const PuppyMarketplace = () => {
  const { listings, loading } = useDogListings();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Puppies...</h2>
          <p className="text-gray-600">Finding the perfect companions for you</p>
        </div>
        <LoadingSkeleton viewMode="grid" count={8} />
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Puppies</h2>
          <p className="text-gray-600">Discover your new best friend</p>
        </div>
        <EmptyState
          onClearFilters={() => {}}
          hasActiveFilters={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Puppies</h2>
        <p className="text-gray-600">{listings.length} puppies looking for loving homes</p>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onFavorite={() => {}}
            onContact={() => {}}
            onViewDetails={() => {}}
            isFavorited={false}
            showEnhancedActions={true}
          />
        ))}
      </div>
    </div>
  );
};

export default PuppyMarketplace;
