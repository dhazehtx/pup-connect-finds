
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import ListingsGrid from '@/components/ListingsGrid';
import PopularBreeds from './PopularBreeds';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import CreateListingModal from '@/components/listings/CreateListingModal';
import { useAuth } from '@/contexts/AuthContext';

interface ExploreContainerProps {
  listings: any[];
  loading?: boolean;
  filters: any;
  searchQuery: string;
  onFilterChange: (filters: any) => void;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
}

const ExploreContainer = ({
  listings,
  loading = false,
  filters,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onSearch
}: ExploreContainerProps) => {
  const { user } = useAuth();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const breedOptions = [
    'Labrador Retriever',
    'Golden Retriever',
    'German Shepherd',
    'French Bulldog',
    'Bulldog',
    'Poodle',
    'Beagle',
    'Rottweiler',
    'Yorkshire Terrier',
    'Dachshund'
  ];

  // Fix: Make popularBreeds a string array as expected by PopularBreeds component
  const popularBreeds = [
    'Golden Retriever',
    'Labrador Retriever', 
    'German Shepherd',
    'French Bulldog',
    'Poodle',
    'Beagle'
  ];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  const handlePaperworkChange = (key: string, checked: boolean) => {
    const newPaperwork = { ...filters.paperwork, [key]: checked };
    handleFilterChange('paperwork', newPaperwork);
  };

  const handlePriceRangeChange = (values: number[]) => {
    handleFilterChange('priceMin', values[0].toString());
    handleFilterChange('priceMax', values[1].toString());
  };

  const handleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const handleContact = (id: string) => {
    console.log('Contact listing:', id);
  };

  const handleViewDetails = (id: string) => {
    console.log('View details:', id);
  };

  const handleBreedSelect = (breed: string) => {
    handleFilterChange('breed', breed);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header with Create Listing Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explore Dogs</h1>
          <p className="text-gray-600">Find your perfect companion</p>
        </div>
        {user && <CreateListingModal />}
      </div>

      {/* Search & Filter Section */}
      <Card>
        <CardContent className="p-6">
          {/* Top Row - Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search Bar */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for puppies..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Breed Dropdown */}
            <Select value={filters.breed || 'all'} onValueChange={(value) => handleFilterChange('breed', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select breed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Breeds</SelectItem>
                {breedOptions.map(breed => (
                  <SelectItem key={breed} value={breed}>
                    {breed}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Verified Only */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verifiedOnly}
                onCheckedChange={(checked) => handleFilterChange('verifiedOnly', checked)}
              />
              <Label htmlFor="verified" className="text-sm font-medium">
                Verified only
              </Label>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
              {showAdvancedFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Advanced Filters Section (Expandable) */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Sort By */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Source</Label>
                  <Select onValueChange={(value) => handleFilterChange('source', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breeder">Breeder</SelectItem>
                      <SelectItem value="shelter">Shelter</SelectItem>
                      <SelectItem value="rescue">Rescue</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Group */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Age Group</Label>
                  <Select onValueChange={(value) => handleFilterChange('ageGroup', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Ages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="puppy">Puppy (0-1 year)</SelectItem>
                      <SelectItem value="young">Young (1-3 years)</SelectItem>
                      <SelectItem value="adult">Adult (3-7 years)</SelectItem>
                      <SelectItem value="senior">Senior (7+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gender</Label>
                  <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Color</Label>
                  <Select value={filters.color} onValueChange={(value) => handleFilterChange('color', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="brown">Brown</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="golden">Golden</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Coat Length */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Coat Length</Label>
                  <Select value={filters.coatLength} onValueChange={(value) => handleFilterChange('coatLength', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="px-2">
                  <Slider
                    value={[
                      parseInt(filters.priceMin) || 0,
                      parseInt(filters.priceMax) || 5000
                    ]}
                    onValueChange={handlePriceRangeChange}
                    max={5000}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>${filters.priceMin || 0}</span>
                    <span>${filters.priceMax || 5000}</span>
                  </div>
                </div>
              </div>

              {/* Age Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Min Age (months)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.ageMin}
                    onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Max Age (months)</Label>
                  <Input
                    type="number"
                    placeholder="24"
                    value={filters.ageMax}
                    onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Location</Label>
                  <Input
                    placeholder="City, State or ZIP"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Distance (miles)</Label>
                  <Select 
                    value={filters.distance?.toString()} 
                    onValueChange={(value) => handleFilterChange('distance', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="25 miles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                      <SelectItem value="100">100 miles</SelectItem>
                      <SelectItem value="250">250 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Size, Training, Energy */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Size</Label>
                  <Select value={filters.size} onValueChange={(value) => handleFilterChange('size', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (under 25 lbs)</SelectItem>
                      <SelectItem value="medium">Medium (25-60 lbs)</SelectItem>
                      <SelectItem value="large">Large (60-100 lbs)</SelectItem>
                      <SelectItem value="extra-large">Extra Large (100+ lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Training Level</Label>
                  <Select value={filters.trainingLevel} onValueChange={(value) => handleFilterChange('trainingLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Training</SelectItem>
                      <SelectItem value="basic">Basic Training</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Energy Level</Label>
                  <Select value={filters.energyLevel} onValueChange={(value) => handleFilterChange('energyLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="very-high">Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Paperwork Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Paperwork & Health</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="healthCert"
                      checked={filters.paperwork?.healthCertificate}
                      onCheckedChange={(checked) => handlePaperworkChange('healthCertificate', checked as boolean)}
                    />
                    <Label htmlFor="healthCert" className="text-sm">Health Certificate</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vaccinations"
                      checked={filters.paperwork?.vaccinations}
                      onCheckedChange={(checked) => handlePaperworkChange('vaccinations', checked as boolean)}
                    />
                    <Label htmlFor="vaccinations" className="text-sm">Vaccinations</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="parentalScreening"
                      checked={filters.paperwork?.parentalScreening}
                      onCheckedChange={(checked) => handlePaperworkChange('parentalScreening', checked as boolean)}
                    />
                    <Label htmlFor="parentalScreening" className="text-sm">Parental Screening</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="registrationPapers"
                      checked={filters.paperwork?.registrationPapers}
                      onCheckedChange={(checked) => handlePaperworkChange('registrationPapers', checked as boolean)}
                    />
                    <Label htmlFor="registrationPapers" className="text-sm">Registration Papers</Label>
                  </div>
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="flex justify-center pt-4">
                <Button onClick={onSearch} className="px-8">
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Breeds */}
      <PopularBreeds 
        popularBreeds={popularBreeds}
        selectedBreed={filters.breed}
        onBreedSelect={handleBreedSelect}
      />

      {/* Results */}
      {loading ? (
        <LoadingSkeleton viewMode="grid" />
      ) : (
        <ListingsGrid 
          listings={listings}
          viewMode="grid"
          favorites={favorites}
          onFavorite={handleFavorite}
          onContact={handleContact}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};

export default ExploreContainer;
