
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Heart, MessageCircle } from 'lucide-react';

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

interface ListingsComparisonProps {
  listings: Listing[];
  onRemoveListing: (listingId: string) => void;
  onContactSeller: (listing: Listing) => void;
  onAddToFavorites: (listing: Listing) => void;
}

const ListingsComparison = ({ 
  listings, 
  onRemoveListing, 
  onContactSeller, 
  onAddToFavorites 
}: ListingsComparisonProps) => {
  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 mb-4">No listings to compare</p>
          <p className="text-sm text-gray-400">Add listings from the search results to compare them here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Compare Listings ({listings.length}/4)</h2>
        <Badge variant="outline">Side by side comparison</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveListing(listing.id)}
              className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>

            <CardHeader className="pb-3">
              {listing.image_url && (
                <img 
                  src={listing.image_url} 
                  alt={listing.dog_name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <CardTitle className="text-lg">{listing.dog_name}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Breed:</span>
                  <span className="text-sm font-medium">{listing.breed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <Badge variant="secondary">${listing.price}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Age:</span>
                  <span className="text-sm">{listing.age} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Location:</span>
                  <span className="text-sm">{listing.location}</span>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2">
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => onContactSeller(listing)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => onAddToFavorites(listing)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Add to Favorites
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Feature</th>
                    {listings.map(listing => (
                      <th key={listing.id} className="text-center p-2">{listing.dog_name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Price</td>
                    {listings.map(listing => (
                      <td key={listing.id} className="text-center p-2">${listing.price}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Age</td>
                    {listings.map(listing => (
                      <td key={listing.id} className="text-center p-2">{listing.age} months</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Breed</td>
                    {listings.map(listing => (
                      <td key={listing.id} className="text-center p-2">{listing.breed}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ListingsComparison;
