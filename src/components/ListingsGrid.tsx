
import React from 'react';
import ListingCard from './ListingCard';

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
}

const ListingsGrid = ({ 
  listings, 
  viewMode, 
  favorites, 
  onFavorite, 
  onContact, 
  onViewDetails 
}: ListingsGridProps) => {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No puppies found matching your criteria</p>
        <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-6 max-w-4xl mx-auto' : 'space-y-0'}>
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
