
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, MapPin, Heart, Sliders, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ListingCard from '@/components/explore/ListingCard';
import ListingsSkeleton from '@/components/explore/ListingsSkeleton';
import ErrorState from '@/components/ui/error-state';
import AdvancedFiltersPanel from '@/components/explore/AdvancedFiltersPanel';
import UserSearchBar from '@/components/search/UserSearchBar';

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
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('puppies');
  
  // Advanced filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    breed: 'All Breeds',
    minPrice: '',
    maxPrice: '',
    ageGroup: 'All Ages',
    gender: 'All Genders',
    sourceType: 'All Sources',
    maxDistance: 'Any distance',
    verifiedOnly: false,
    availableOnly: false,
    priceRange: [0, 10000] as [number, number],
    sortBy: 'newest',
    source: 'All Sources',
    color: 'All Colors',
    coatLength: 'All Coat Types',
    minAge: '',
    maxAge: '',
    location: '',
    size: 'Any Size',
    trainingLevel: 'Any',
    energyLevel: 'Any',
    paperwork: 'Any',
    availableNow: false,
    healthChecked: false,
    vaccinated: false,
    spayedNeutered: false,
    goodWithKids: false,
    goodWithPets: false
  });

  const { toast } = useToast();

  const popularBreeds = [
    'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 
    'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler'
  ];

  const dogColors = ['Black', 'Brown', 'White', 'Golden', 'Gray', 'Cream', 'Red', 'Blue', 'Merle'];
  const coatLengthOptions = ['Short', 'Medium', 'Long', 'Curly', 'Wire'];
  const distanceOptions = ['5', '10', '25', '50', 'Any distance'];
  const sizeOptions = ['Small', 'Medium', 'Large', 'Extra Large'];
  const energyLevels = ['Low', 'Medium', 'High', 'Very High'];
  const trainingLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

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
    
    const matchesBreed = !selectedBreed || selectedBreed === 'All Breeds' || listing.breed === selectedBreed;
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];
    const matchesAge = listing.age >= ageRange[0] && listing.age <= ageRange[1];
    const matchesVerified = !verifiedOnly || listing.profiles?.verified;
    
    return matchesSearch && matchesBreed && matchesPrice && matchesAge && matchesVerified;
  });

  const handleFilterUpdate = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Sync with existing filter states
    if (key === 'breed') {
      setSelectedBreed(value === 'All Breeds' ? '' : value);
    } else if (key === 'verifiedOnly') {
      setVerifiedOnly(value);
    } else if (key === 'priceRange') {
      setPriceRange(value);
    } else if (key === 'searchTerm') {
      setSearchTerm(value);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedBreed('');
    setPriceRange([0, 10000]);
    setAgeRange([0, 24]);
    setVerifiedOnly(false);
    setFilters({
      searchTerm: '',
      breed: 'All Breeds',
      minPrice: '',
      maxPrice: '',
      ageGroup: 'All Ages',
      gender: 'All Genders',
      sourceType: 'All Sources',
      maxDistance: 'Any distance',
      verifiedOnly: false,
      availableOnly: false,
      priceRange: [0, 10000] as [number, number],
      sortBy: 'newest',
      source: 'All Sources',
      color: 'All Colors',
      coatLength: 'All Coat Types',
      minAge: '',
      maxAge: '',
      location: '',
      size: 'Any Size',
      trainingLevel: 'Any',
      energyLevel: 'Any',
      paperwork: 'Any',
      availableNow: false,
      healthChecked: false,
      vaccinated: false,
      spayedNeutered: false,
      goodWithKids: false,
      goodWithPets: false
    });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore</h1>
          <p className="text-gray-600">Find your perfect furry companion or connect with other pet lovers</p>
        </div>

        {/* Tab Navigation - Updated to Royal Blue */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-blue-50 border border-blue-200">
            <TabsTrigger 
              value="puppies" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-600"
            >
              <Heart className="w-4 h-4" />
              Puppies
            </TabsTrigger>
            <TabsTrigger 
              value="community" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-600"
            >
              <Users className="w-4 h-4" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="puppies" className="space-y-6">
            {/* Search and Basic Filters */}
            <Card className="border-blue-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Search & Filter Puppies</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
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

                  {/* Clear Filters - Updated to Royal Blue */}
                  <Button 
                    variant="outline" 
                    onClick={clearAllFilters}
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <Card className="border-blue-200 shadow-sm">
                <CardContent className="p-0">
                  <AdvancedFiltersPanel
                    filters={filters}
                    popularBreeds={popularBreeds}
                    dogColors={dogColors}
                    coatLengthOptions={coatLengthOptions}
                    distanceOptions={distanceOptions}
                    sizeOptions={sizeOptions}
                    energyLevels={energyLevels}
                    trainingLevels={trainingLevels}
                    onFilterUpdate={handleFilterUpdate}
                    onClearAllFilters={clearAllFilters}
                  />
                </CardContent>
              </Card>
            )}

            {/* Popular Breeds */}
            <div>
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
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
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
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            {/* User Search */}
            <Card className="border-blue-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Find Other Pet Lovers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserSearchBar />
              </CardContent>
            </Card>

            {/* Community Features Placeholder */}
            <Card className="border-blue-200 shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Features</h3>
                <p className="text-gray-600">
                  Connect with other pet lovers, share experiences, and find local pet events.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
