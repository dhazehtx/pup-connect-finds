
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Heart, Sliders } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ListingCard from '@/components/explore/ListingCard';
import ListingsSkeleton from '@/components/explore/ListingsSkeleton';
import ErrorState from '@/components/ui/error-state';
import AdvancedFilters from '@/components/search/AdvancedFilters';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  location?: string;
  image_url?: string;
  profiles?: {
    full_name: string;
    verified: boolean;
    rating?: number;
  };
}

const Explore = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 24]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const { toast } = useToast();

  const popularBreeds = [
    'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 
    'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler'
  ];

  useEffect(() => {
    document.title = 'Explore Puppies - My Pup';
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('dog_listings')
        .select(`
          id,
          dog_name,
          breed,
          age,
          price,
          location,
          image_url,
          profiles!dog_listings_user_id_fkey (
            full_name,
            verified,
            rating
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setListings(data || []);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchTerm || 
      listing.dog_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBreed = !selectedBreed || listing.breed === selectedBreed;
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];
    const matchesAge = listing.age >= ageRange[0] && listing.age <= ageRange[1];
    const matchesVerified = !verifiedOnly || listing.profiles?.verified;
    
    return matchesSearch && matchesBreed && matchesPrice && matchesAge && matchesVerified;
  });

  const handleAdvancedFilterChange = (key: string, value: any) => {
    switch (key) {
      case 'priceRange':
        setPriceRange(value);
        break;
      case 'ageRange':
        setAgeRange(value);
        break;
      case 'breeds':
        setSelectedBreed(value.length > 0 ? value[0] : '');
        break;
      case 'verified':
        setVerifiedOnly(value);
        break;
      default:
        break;
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedBreed('');
    setPriceRange([0, 10000]);
    setAgeRange([0, 24]);
    setVerifiedOnly(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ErrorState
            title="Failed to load listings"
            message={error}
            onRetry={fetchListings}
            variant="detailed"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Puppies</h1>
          <p className="text-gray-600">Find your perfect furry companion</p>
        </div>

        {/* Search and Basic Filters */}
        <Card className="border-blue-200 shadow-sm mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Search & Filter</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                Advanced Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search puppies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Breed Filter */}
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="">All Breeds</option>
                {popularBreeds.map(breed => (
                  <option key={breed} value={breed}>{breed}</option>
                ))}
              </select>

              {/* Verified Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified-only"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="verified-only" className="text-sm">
                  Verified only
                </label>
              </div>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={clearAllFilters}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="mt-6 pt-6 border-t">
                <AdvancedFilters
                  priceRange={priceRange}
                  ageRange={ageRange}
                  breeds={selectedBreed ? [selectedBreed] : []}
                  verified={verifiedOnly}
                  availableBreeds={popularBreeds}
                  onPriceRangeChange={(range) => handleAdvancedFilterChange('priceRange', range)}
                  onAgeRangeChange={(range) => handleAdvancedFilterChange('ageRange', range)}
                  onBreedToggle={(breed) => {
                    const newBreeds = selectedBreed === breed ? [] : [breed];
                    handleAdvancedFilterChange('breeds', newBreeds);
                  }}
                  onVerifiedToggle={() => handleAdvancedFilterChange('verified', !verifiedOnly)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Breeds */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Breeds</h2>
          <div className="flex flex-wrap gap-2">
            {popularBreeds.map(breed => (
              <Badge
                key={breed}
                variant={selectedBreed === breed ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedBreed === breed 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                }`}
                onClick={() => setSelectedBreed(selectedBreed === breed ? '' : breed)}
              >
                {breed}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {loading ? 'Loading...' : `${filteredListings.length} Puppies Found`}
            </h2>
            {!loading && filteredListings.length > 0 && (
              <select className="px-3 py-2 border border-input rounded-md bg-background text-sm">
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="age">Age: Youngest First</option>
              </select>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <ListingsSkeleton />
        ) : filteredListings.length === 0 ? (
          <Card className="border-blue-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No puppies found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search filters to find more puppies.
              </p>
              <Button 
                onClick={clearAllFilters}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
