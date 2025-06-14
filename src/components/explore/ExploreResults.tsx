
import React from 'react';
import ExploreListingsGrid from '@/components/explore/ExploreListingsGrid';
import ErrorBoundary from '@/components/ErrorBoundary';

interface Listing {
  id: number;
  title: string;
  breed: string;
  age: string;
  location: string;
  distance: string;
  price: string;
  image: string;
  verified: boolean;
  sourceType?: string;
  rating: number;
  reviews: number;
  breeder: string;
  color?: string;
  gender?: string;
  verifiedBreeder?: boolean;
  idVerified?: boolean;
  vetVerified?: boolean;
  available?: number;
  isKillShelter?: boolean;
}

interface ExploreResultsProps {
  listings: Listing[];
  favorites: Set<number>;
  sortBy: string;
  hasActiveFilters: boolean;
  onToggleFavorite: (listingId: number) => void;
  onContactSeller: (listing: any) => void;
  onViewDetails: (listing: any) => void;
  onResetFilters: () => void;
  onSortChange: (sortBy: string) => void;
}

const ExploreResults = ({
  listings,
  favorites,
  sortBy,
  hasActiveFilters,
  onToggleFavorite,
  onContactSeller,
  onViewDetails,
  onResetFilters,
  onSortChange
}: ExploreResultsProps) => {
  const renderListingsGrid = () => {
    try {
      if (!Array.isArray(listings)) {
        console.warn('listings is not an array:', listings);
        return <div className="text-center py-8 text-muted-foreground">No listings available</div>;
      }

      if (listings.length === 0) {
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">No listings found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or check back later for new listings.</p>
            {hasActiveFilters && (
              <button 
                onClick={onResetFilters}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        );
      }

      return (
        <ErrorBoundary fallback={<div className="text-center py-8 text-destructive">Error loading listings</div>}>
          <ExploreListingsGrid 
            listings={listings}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onContactSeller={onContactSeller}
            onViewDetails={onViewDetails}
          />
        </ErrorBoundary>
      );
    } catch (error) {
      console.error('Error rendering ExploreListingsGrid:', error);
      return <div className="text-center py-8 text-destructive">Error loading listings</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Results count and sort options */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {listings.length} puppies available
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-sm border border-border rounded-md bg-background text-foreground px-2 py-1"
          >
            <option value="newest">Newest first</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="distance">Distance</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {renderListingsGrid()}
    </div>
  );
};

export default ExploreResults;
