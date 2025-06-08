
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import EnhancedSearchInterface from '@/components/search/EnhancedSearchInterface';
import ListingsMapView from '@/components/maps/ListingsMapView';
import ListingsComparison from '@/components/comparison/ListingsComparison';
import ListView from './ListView';
import ViewSelector from './ViewSelector';
import { useToast } from '@/hooks/use-toast';

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

const SAMPLE_LISTINGS: Listing[] = [
  {
    id: '1',
    dog_name: 'Luna',
    breed: 'Golden Retriever',
    price: 1200,
    age: 8,
    location: 'San Francisco, CA',
    image_url: '/placeholder.svg',
    description: 'Beautiful golden retriever puppy, well-socialized and ready for a loving home.',
    user_id: 'user1',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    dog_name: 'Max',
    breed: 'Labrador',
    price: 900,
    age: 12,
    location: 'Los Angeles, CA',
    image_url: '/placeholder.svg',
    description: 'Friendly lab puppy with great temperament.',
    user_id: 'user2',
    created_at: '2024-01-14T15:30:00Z'
  }
];

const AVAILABLE_BREEDS = [
  'Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 
  'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier'
];

const EnhancedMarketplace = () => {
  const [activeView, setActiveView] = useState<'list' | 'map' | 'compare'>('list');
  const [filteredListings, setFilteredListings] = useState<Listing[]>(SAMPLE_LISTINGS);
  const [selectedListing, setSelectedListing] = useState<Listing | undefined>();
  const [comparisonListings, setComparisonListings] = useState<Listing[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSearch = (filters: any) => {
    // Simulate filtering
    let filtered = SAMPLE_LISTINGS;
    
    if (filters.query) {
      filtered = filtered.filter(listing => 
        listing.dog_name.toLowerCase().includes(filters.query.toLowerCase()) ||
        listing.breed.toLowerCase().includes(filters.query.toLowerCase())
      );
    }
    
    if (filters.breeds.length > 0) {
      filtered = filtered.filter(listing => 
        filters.breeds.includes(listing.breed)
      );
    }
    
    if (filters.priceRange) {
      filtered = filtered.filter(listing => 
        listing.price >= filters.priceRange[0] && listing.price <= filters.priceRange[1]
      );
    }
    
    setFilteredListings(filtered);
  };

  const handleSaveSearch = (filters: any, name: string) => {
    setSavedSearches(prev => [...prev, { name, filters }]);
    toast({
      title: "Search Saved",
      description: `"${name}" has been saved to your searches.`,
    });
  };

  const handleContactSeller = (listing: Listing) => {
    toast({
      title: "Contact Seller",
      description: `Opening conversation with seller of ${listing.dog_name}`,
    });
  };

  const handleAddToFavorites = (listing: Listing) => {
    toast({
      title: "Added to Favorites",
      description: `${listing.dog_name} has been added to your favorites.`,
    });
  };

  const handleAddToComparison = (listing: Listing) => {
    if (comparisonListings.length >= 4) {
      toast({
        title: "Comparison Limit",
        description: "You can compare up to 4 listings at a time.",
        variant: "destructive"
      });
      return;
    }
    
    if (!comparisonListings.find(l => l.id === listing.id)) {
      setComparisonListings(prev => [...prev, listing]);
      toast({
        title: "Added to Comparison",
        description: `${listing.dog_name} added to comparison.`,
      });
    }
  };

  const handleRemoveFromComparison = (listingId: string) => {
    setComparisonListings(prev => prev.filter(l => l.id !== listingId));
  };

  const handleListingSelect = (listing: Listing) => {
    setSelectedListing(listing);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced search */}
      <EnhancedSearchInterface
        onSearch={handleSearch}
        availableBreeds={AVAILABLE_BREEDS}
        savedSearches={savedSearches}
        onSaveSearch={handleSaveSearch}
      />

      {/* View selector */}
      <ViewSelector
        activeView={activeView}
        onViewChange={setActiveView}
        listingsCount={filteredListings.length}
        comparisonCount={comparisonListings.length}
      />

      {/* Content views */}
      <Tabs value={activeView} className="w-full">
        <TabsContent value="list" className="space-y-4">
          <ListView
            listings={filteredListings}
            onContactSeller={handleContactSeller}
            onAddToFavorites={handleAddToFavorites}
            onAddToComparison={handleAddToComparison}
          />
        </TabsContent>

        <TabsContent value="map">
          <ListingsMapView
            listings={filteredListings}
            selectedListing={selectedListing}
            onListingSelect={handleListingSelect}
            userLocation={{ lat: 37.7749, lng: -122.4194 }} // San Francisco
          />
        </TabsContent>

        <TabsContent value="compare">
          <ListingsComparison
            listings={comparisonListings}
            onRemoveListing={handleRemoveFromComparison}
            onContactSeller={handleContactSeller}
            onAddToFavorites={handleAddToFavorites}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedMarketplace;
