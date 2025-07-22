
import React from 'react';
import ListingCard from './ListingCard';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  price: number;
  age: number;
  location: string;
  image_url?: string;
  description?: string;
  user_id: string;
  created_at: string;
}

interface ListViewProps {
  listings: Listing[];
  onContactSeller: (listing: Listing) => void;
  onAddToFavorites: (listing: Listing) => void;
  onAddToComparison: (listing: Listing) => void;
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
