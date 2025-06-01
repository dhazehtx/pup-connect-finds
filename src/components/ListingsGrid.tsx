
import React from 'react';
import ListingCard from './ListingCard';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';

interface Listing {
  id: number;
  title: string;
  price: string;
  location: string;
  distance: string;
  breed: string;
  color: string;
  gender: string;
  age: string;
  rating: number;
  reviews: number;
  image: string;
  breeder: string;
  verified: boolean;
  verifiedBreeder?: boolean;
  idVerified?: boolean;
  vetVerified?: boolean;
  available: number;
  sourceType: string;
  isKillShelter?: boolean;
}

interface ListingsGridProps {
  listings: Listing[];
  viewMode: 'grid' | 'list';
  favorites: number[];
  onFavorite: (id: number) => void;
  onContact: (id: number) => void;
  onViewDetails: (id: number) => void;
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
    return <LoadingSkeleton count={6} />;
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        title="No listings found"
        description={
          hasActiveFilters
            ? "Try adjusting your filters to see more results"
            : "There are no listings available at the moment"
        }
        actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
        onAction={hasActiveFilters ? onClearFilters : undefined}
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
          {...listing}
          isFavorited={favorites.includes(listing.id)}
          onFavorite={onFavorite}
          onContact={onContact}
          onViewDetails={onViewDetails}
          viewMode={viewMode}
          showEnhancedActions={showEnhancedActions}
        />
      ))}
    </div>
  );
};

export default ListingsGrid;
