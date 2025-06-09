
import React from 'react';
import ListingCard from './ListingCard';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';

interface Listing {
  id: string; // Changed from number to string to match ListingCard
  dog_name: string;
  breed: string;
  price: number;
  age: number;
  location: string;
  image_url?: string;
  profiles?: {
    verified?: boolean;
    location?: string;
    rating?: number;
    total_reviews?: number;
  };
  status?: string;
}

interface ListingsGridProps {
  listings: Listing[];
  viewMode: 'grid' | 'list';
  favorites: string[]; // Changed from number[] to string[]
  onFavorite: (id: string) => void; // Changed from number to string
  onContact: (id: string) => void; // Changed from number to string
  onViewDetails: (id: string) => void; // Changed from number to string
  isLoading?: boolean;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  showEnhancedActions?: boolean;
}

const ListingsGrid: React.FC<ListingsGridProps> = ({
  listings,
  viewMode,
  favorites,
  onFavorite,
  onContact,
  onViewDetails,
  isLoading = false,
  onClearFilters,
  hasActiveFilters = false,
  showEnhancedActions = false
}) => {
  if (isLoading) {
    return <LoadingSkeleton viewMode={viewMode} count={6} />;
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        onClearFilters={onClearFilters || (() => {})}
        hasActiveFilters={hasActiveFilters}
      />
    );
  }

  const gridClasses = viewMode === 'list' 
    ? "space-y-4"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

  return (
    <div className={gridClasses}>
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isFavorited={favorites.includes(listing.id)}
          onFavorite={onFavorite}
          onContact={onContact}
          onViewDetails={onViewDetails}
          showEnhancedActions={showEnhancedActions}
        />
      ))}
    </div>
  );
};

export default ListingsGrid;
