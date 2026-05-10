
import React from 'react';
import ListingCard from './ListingCard';
import { MarketplaceListing } from '@/types/marketplace';

interface ListViewProps {
  listings: MarketplaceListing[];
  onContactSeller: (listing: MarketplaceListing) => void;
  onAddToFavorites: (listing: MarketplaceListing) => void;
  onAddToComparison: (listing: MarketplaceListing) => void;
}

const ListView = ({ 
  listings, 
  onContactSeller, 
  onAddToFavorites, 
  onAddToComparison 
}: ListViewProps) => {
  return (
    <div className="grid gap-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onContactSeller={onContactSeller}
          onAddToFavorites={onAddToFavorites}
          onAddToComparison={onAddToComparison}
        />
      ))}
    </div>
  );
};

export default ListView;
