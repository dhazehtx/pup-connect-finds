
import React from 'react';
import ListingCard from './ListingCard';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

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
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const ListingsGrid = ({ 
  listings, 
  viewMode, 
  favorites, 
  onFavorite, 
  onContact, 
  onViewDetails,
  isLoading = false,
  onClearFilters,
  hasActiveFilters
}: ListingsGridProps) => {
  if (isLoading) {
    return <LoadingSkeleton viewMode={viewMode} />;
  }

  if (listings.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} hasActiveFilters={hasActiveFilters} />;
  }

  return (
    <div className={
      viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto' 
        : 'space-y-0'
    }>
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          viewMode={viewMode}
          onFavorite={onFavorite}
          onContact={onContact}
          onViewDetails={onViewDetails}
          isFavorited={favorites.includes(listing.id)}
        />
      ))}
    </div>
  );
};

export default ListingsGrid;
