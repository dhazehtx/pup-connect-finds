
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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

  // Advanced filters state - matching the screenshot
  const [advancedFilters, setAdvancedFilters] = useState({
    sortBy: 'newest',
    breed: 'all',
    source: 'all',
    ageGroup: 'all',
    gender: 'all',
    color: 'all',
    coatLength: 'all',
    priceRange: [0, 10000] as [number, number],
    minAge: '',
    maxAge: '',
    location: '',
    distance: 'all',
    size: 'all',
    trainingLevel: 'all',
    energyLevel: 'all',
    paperwork: 'all',
    verifiedOnly: false,
    availableNow: false,
    healthChecked: false,
    vaccinated: false,
    spayedNeutered: false,
    goodWithKids: false,
    goodWithPets: false
  });

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

  // Filter options matching the screenshot
  const sortOptions = ['Newest First', 'Oldest First', 'Price: Low to High', 'Price: High to Low', 'Distance', 'Age: Youngest First', 'Age: Oldest First'];
  const breedOptions = ['All Breeds', ...popularBreeds];
  const sourceOptions = ['All Sources', 'Breeders', 'Shelters', 'Rescues'];
  const ageGroupOptions = ['All Ages', 'Puppies (0-1 year)', 'Young (1-3 years)', 'Adult (3+ years)'];
  const genderOptions = ['All Genders', 'Male', 'Female'];
  const colorOptions = ['All Colors', 'Black', 'Brown', 'White', 'Golden', 'Cream', 'Red', 'Blue', 'Merle', 'Brindle', 'Sable'];
  const coatLengthOptions = ['All Coat Types', 'Short', 'Medium', 'Long', 'Wire'];
  const distanceOptions = ['Any distance', '5 miles', '10 miles', '25 miles', '50 miles', '100 miles'];
  const sizeOptions = ['Any Size', 'Small (Under 25 lbs)', 'Medium (25-60 lbs)', 'Large (60-100 lbs)', 'Giant (Over 100 lbs)'];
  const trainingLevelOptions = ['Any Level', 'Beginner Friendly', 'Moderate', 'Advanced', 'Expert'];
  const energyLevelOptions = ['Any Level', 'Low', 'Moderate', 'High', 'Very High'];
  const paperworkOptions = ['Any', 'Papers Available', 'Champion Bloodline', 'Health Certificate'];

  const handleAdvancedFilterChange = (key: string, value: any) => {
    setAdvancedFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      sortBy: 'newest',
      breed: 'all',
      source: 'all',
      ageGroup: 'all',
      gender: 'all',
      color: 'all',
      coatLength: 'all',
      priceRange: [0, 10000] as [number, number],
      minAge: '',
      maxAge: '',
      location: '',
      distance: 'all',
      size: 'all',
      trainingLevel: 'all',
      energyLevel: 'all',
      paperwork: 'all',
      verifiedOnly: false,
      availableNow: false,
      healthChecked: false,
      vaccinated: false,
      spayedNeutered: false,
      goodWithKids: false,
      goodWithPets: false
    });
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Puppies</h1>
          <p className="text-gray-600">Find your perfect furry companion</p>
        </div>

        {/* Search & Filter Section */}
        <div className="mb-6">
          <Card className="p-4">
            {/* Basic Filters Row */}
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

            {/* Advanced Filters Panel - Inline Expansion */}
            {showAdvancedFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                  <Button variant="outline" size="sm" onClick={clearAdvancedFilters}>
                    Clear All
                  </Button>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <Select value={advancedFilters.sortBy} onValueChange={(value) => handleAdvancedFilterChange('sortBy', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option} value={option.toLowerCase().replace(/[^a-z0-9]/g, '-')}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Top Row Filters */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                    <Select value={advancedFilters.breed} onValueChange={(value) => handleAdvancedFilterChange('breed', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {breedOptions.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/[^a-z0-9]/g, '-')}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <Select value={advancedFilters.source} onValueChange={(value) => handleAdvancedFilterChange('source', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceOptions.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/[^a-z0-9]/g, '-')}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                    <Select value={advancedFilters.ageGroup} onValueChange={(value) => handleAdvancedFilterChange('ageGroup', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ageGroupOptions.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/[^a-z0-9]/g, '-')}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <Select value={advancedFilters.gender} onValueChange={(value) => handleAdvancedFilterChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/[^a-z0-9]/g, '-')}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <Select value={advancedFilters.color} onValueChange={(value) => handleAdvancedFilterChange('color', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/[^a-z0-9]/g, '-')}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coat Length</label>
                    <Select value={advancedFilters.coatLength} onValueChange={(value) => handleAdvancedFilterChange('coatLength', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {coatLengthOptions.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/[^a-z0-9]/g, '-')}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: ${advancedFilters.priceRange[0]} - ${advancedFilters.priceRange[1]}
                  </label>
                  <Slider
                    value={advancedFilters.priceRange}
                    onValueChange={(value) => handleAdvancedFilterChange('priceRange', value as [number, number])}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>

                {/* Age Range Inputs and Location */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Age (weeks)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={advancedFilters.minAge}
                      onChange={(e) => handleAdvancedFilterChange('minAge', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Age (weeks)</label>
                    <Input
                      type="number"
                      placeholder="104"
                      value={advancedFilters.maxAge}
                      onChange={(e) => handleAdvancedFilterChange('maxAge', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <Input
                      placeholder="City, State"
                      value={advancedFilters.location}
                      onChange={(e) => handleAdvancedFilterChange('location', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
                    <Select value={advancedFilters.distance} onValueChange={(value) => handleAdvancedFilterChange('distance', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {distanceOptions.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/[^a-z0-9]/g, '-')}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bottom Row Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <Select value={advancedFilters.size} onValueChange={(value) => handleAdvancedFilterChange('size', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/[^a-z0-9]/g, '-')}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Training Level</label>
                    <Select value={advancedFilters.trainingLevel} onValueChange={(value) => handleAdvancedFilterChange('trainingLevel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {trainingLevelOptions.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/[^a-z0-9]/g, '-')}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Energy Level</label>
                    <Select value={advancedFilters.energyLevel} onValueChange={(value) => handleAdvancedFilterChange('energyLevel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {energyLevelOptions.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/[^a-z0-9]/g, '-')}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paperwork</label>
                    <Select value={advancedFilters.paperwork} onValueChange={(value) => handleAdvancedFilterChange('paperwork', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paperworkOptions.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/[^a-z0-9]/g, '-')}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Checkboxes - Two Rows */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={advancedFilters.verifiedOnly}
                        onChange={(e) => handleAdvancedFilterChange('verifiedOnly', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Verified only</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={advancedFilters.availableNow}
                        onChange={(e) => handleAdvancedFilterChange('availableNow', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Available now</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={advancedFilters.healthChecked}
                        onChange={(e) => handleAdvancedFilterChange('healthChecked', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Health checked</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={advancedFilters.vaccinated}
                        onChange={(e) => handleAdvancedFilterChange('vaccinated', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Vaccinated</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={advancedFilters.spayedNeutered}
                        onChange={(e) => handleAdvancedFilterChange('spayedNeutered', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Spayed/Neutered</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={advancedFilters.goodWithKids}
                        onChange={(e) => handleAdvancedFilterChange('goodWithKids', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Good with kids</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={advancedFilters.goodWithPets}
                        onChange={(e) => handleAdvancedFilterChange('goodWithPets', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Good with pets</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
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
