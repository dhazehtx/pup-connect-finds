
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ListingCard from './ListingCard';

interface Listing {
  id: number;
  title: string;
  price: string;
  adoptionFee: boolean;
  location: string;
  distance: string;
  breed: string;
  color: string;
  gender: string;
  age: string;
  genetics: string[];
  rating: number;
  reviews: number;
  images: string[];
  videos: string[];
  breeder: {
    name: string;
    profilePicture: string;
    phone: string;
    email: string;
  };
  verified: boolean;
  available: number;
  vaccinations: {
    status: string;
    details: string[];
  };
  healthHistory: string;
  dnaTests: string[];
  healthTests: string[];
}

interface ListingsGridProps {
  listings: Listing[];
}

const ListingsGrid = ({ listings }: ListingsGridProps) => {
  return (
    <>
      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{listings.length} puppies available</h2>
        <Select defaultValue="newest">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="distance">Distance</SelectItem>
            <SelectItem value="rating">Highest rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </>
  );
};

export default ListingsGrid;
