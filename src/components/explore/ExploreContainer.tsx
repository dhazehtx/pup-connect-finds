
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

// Database listing type from the hook
interface DatabaseListing {
  id: string;
  dog_name?: string;
  breed?: string;
  age?: number;
  price?: number;
  location?: string;
  image_url?: string;
  profiles?: {
    full_name?: string;
    verified?: boolean;
  };
}

// Transformed listing type for the UI
interface TransformedListing {
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

interface ExploreContainerProps {
  listings: DatabaseListing[];
}

const ExploreContainer = ({ listings }: ExploreContainerProps) => {
  const { user } = useAuth();
  const { startConversation } = useMessaging();
  const navigate = useNavigate();

  // Simple filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Transform DatabaseListing[] to TransformedListing[] format
  const transformedListings = useMemo((): TransformedListing[] => {
    if (!Array.isArray(listings)) {
      return [];
    }
    
    try {
      const validListings = listings.filter(listing => listing && typeof listing === 'object');
      
      if (validListings.length === 0) {
        return [];
      }
      
      return validListings.map((listing, index): TransformedListing => ({
        id: index + 1,
        title: listing?.dog_name || 'Unknown Dog',
        price: `$${listing?.price || 0}`,
        location: listing?.location || 'Unknown',
        distance: '5.0',
        breed: listing?.breed || 'Mixed Breed',
        color: 'Mixed',
        gender: 'Unknown',
        age: `${listing?.age || 0} weeks`,
        rating: 4.5,
        reviews: 10,
        image: listing?.image_url || '/placeholder-dog.jpg',
        breeder: listing?.profiles?.full_name || 'Unknown Breeder',
        verified: listing?.profiles?.verified || false,
        verifiedBreeder: listing?.profiles?.verified || false,
        idVerified: listing?.profiles?.verified || false,
        vetVerified: false,
        available: 1,
        sourceType: 'breeder',
        isKillShelter: false
      }));
    } catch (error) {
      console.error('Error transforming listings:', error);
      return [];
    }
  }, [listings]);

  // Simple filtering
  const filteredListings = useMemo(() => {
    try {
      if (!Array.isArray(transformedListings) || transformedListings.length === 0) {
        return [];
      }

      let filtered = [...transformedListings];

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(listing => 
          listing.title.toLowerCase().includes(searchLower) ||
          listing.breed.toLowerCase().includes(searchLower) ||
          listing.location.toLowerCase().includes(searchLower)
        );
      }

      // Apply breed filter
      if (selectedBreed !== 'all') {
        filtered = filtered.filter(listing => 
          listing.breed.toLowerCase().includes(selectedBreed.toLowerCase())
        );
      }

      // Apply verified filter
      if (verifiedOnly) {
        filtered = filtered.filter(listing => listing.verified);
      }

      return filtered;
    } catch (error) {
      console.error('Error filtering listings:', error);
      return [];
    }
  }, [transformedListings, searchTerm, selectedBreed, verifiedOnly]);

  const popularBreeds = ['Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler'];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Puppies</h1>
          <p className="text-gray-600">Find your perfect furry companion</p>
        </div>

        {/* Horizontal Tabs Section */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search puppies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Breed Dropdown */}
              <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                <SelectTrigger>
                  <SelectValue placeholder="Select breed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Breeds</SelectItem>
                  {popularBreeds.map((breed) => (
                    <SelectItem key={breed} value={breed.toLowerCase()}>{breed}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Verified Only Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="verified" className="text-sm text-gray-700">Verified only</label>
              </div>

              {/* Advanced Filters Button */}
              <Button
                variant={showAdvancedFilters ? "default" : "outline"}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Advanced Filters
              </Button>
            </div>
          </Card>
        </div>

        {/* Popular Breeds Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Breeds</h3>
          <div className="flex flex-wrap gap-2 overflow-x-auto">
            {popularBreeds.map((breed) => (
              <Badge
                key={breed}
                variant="outline"
                className="cursor-pointer whitespace-nowrap px-4 py-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => setSelectedBreed(breed.toLowerCase())}
              >
                {breed}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{filteredListings.length} Puppies Found</p>
          {filteredListings.length === 0 && (
            <p className="text-gray-400 mt-2">No puppies match your current filters</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreContainer;
