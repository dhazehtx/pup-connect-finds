
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, SlidersHorizontal, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import ListingsGrid from '@/components/ListingsGrid';
import { useDogListings } from '@/hooks/useDogListings';
import { useAuth } from '@/contexts/AuthContext';

const Explore = () => {
  const { listings, loading, searchListings } = useDogListings();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  
  // Filter states
  const [selectedBreed, setSelectedBreed] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [ageRange, setAgeRange] = useState([0, 24]);

  // Convert database listings to the format expected by ListingsGrid
  const convertedListings = listings.map((listing) => ({
    id: parseInt(listing.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to number for compatibility
    title: listing.dog_name,
    price: `$${listing.price}`,
    location: listing.location || 'Location not specified',
    distance: '2.5 miles', // Mock distance for now
    breed: listing.breed,
    color: 'Mixed', // Mock color as it's not in our schema
    gender: 'Unknown', // Mock gender as it's not in our schema
    age: `${listing.age} months`,
    rating: listing.profiles?.rating || 0,
    reviews: listing.profiles?.total_reviews || 0,
    image: listing.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
    breeder: listing.profiles?.full_name || listing.profiles?.username || 'Unknown Breeder',
    verified: Boolean(listing.profiles?.verified),
    verifiedBreeder: Boolean(listing.profiles?.verified),
    idVerified: Boolean(listing.profiles?.verified),
    vetVerified: false, // Mock for now
    available: 1, // Mock for now
    sourceType: 'breeder' as const, // Mock for now
    isKillShelter: false
  }));

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    const filters = {
      breed: selectedBreed,
      location: selectedLocation,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    };
    await searchListings(term, filters);
  };

  const handleApplyFilters = async () => {
    const filters = {
      breed: selectedBreed,
      location: selectedLocation,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    };
    await searchListings(searchTerm, filters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSelectedBreed('');
    setSelectedLocation('');
    setPriceRange([0, 10000]);
    setAgeRange([0, 24]);
    handleSearch('');
  };

  const hasActiveFilters = Boolean(
    selectedBreed || 
    selectedLocation || 
    (priceRange && priceRange[0] > 0) || 
    (priceRange && priceRange[1] < 10000)
  );

  const handleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const handleContact = (id: number) => {
    if (!user) {
      console.log('Please sign in to contact breeders');
      return;
    }
    console.log('Contact breeder for listing:', id);
  };

  const handleViewDetails = (id: number) => {
    console.log('View details for listing:', id);
  };

  useEffect(() => {
    // Initial load is handled by the hook
  }, []);

  return (
    <div className="max-w-6xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold mb-4">Explore Dogs</h1>
        
        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by breed, location, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Filter Results</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Breed Filter */}
                <div className="space-y-2">
                  <Label>Breed</Label>
                  <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select breed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Breeds</SelectItem>
                      <SelectItem value="golden retriever">Golden Retriever</SelectItem>
                      <SelectItem value="labrador">Labrador</SelectItem>
                      <SelectItem value="german shepherd">German Shepherd</SelectItem>
                      <SelectItem value="french bulldog">French Bulldog</SelectItem>
                      <SelectItem value="beagle">Beagle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="Enter city or state"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  />
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>

                {/* Age Range */}
                <div className="space-y-2">
                  <Label>Age Range: {ageRange[0]} - {ageRange[1]} months</Label>
                  <Slider
                    value={ageRange}
                    onValueChange={setAgeRange}
                    max={24}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleApplyFilters} className="flex-1">
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </Button>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {selectedBreed && (
              <Badge variant="secondary" className="capitalize">
                {selectedBreed}
              </Badge>
            )}
            {selectedLocation && (
              <Badge variant="secondary">
                <MapPin className="w-3 h-3 mr-1" />
                {selectedLocation}
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 10000) && (
              <Badge variant="secondary">
                ${priceRange[0]} - ${priceRange[1]}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Listings */}
      <div className="p-4">
        <ListingsGrid
          listings={convertedListings}
          viewMode={viewMode}
          favorites={favorites}
          onFavorite={handleFavorite}
          onContact={handleContact}
          onViewDetails={handleViewDetails}
          isLoading={loading}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          showEnhancedActions={true}
        />
      </div>
    </div>
  );
};

export default Explore;
