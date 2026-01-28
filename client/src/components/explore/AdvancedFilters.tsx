import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  Star
} from 'lucide-react';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
  className?: string;
}

const DOG_BREEDS = [
  'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Bulldog',
  'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
  'Siberian Husky', 'Boxer', 'Great Dane', 'Chihuahua', 'Shih Tzu',
  'Boston Terrier', 'Pomeranian', 'Australian Shepherd', 'Cocker Spaniel',
  'Border Collie', 'French Bulldog', 'Belgian Malinois', 'Mixed Breed'
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    breeds: [] as string[],
    ageRange: [0, 10] as [number, number],
    gender: 'all' as 'all' | 'male' | 'female',
    location: '',
    priceRange: [0, 5000] as [number, number],
    sortBy: 'newest' as 'newest' | 'price_low' | 'price_high' | 'verified' | 'popular',
    verifiedOnly: false,
    healthTested: false,
    vaccinated: false,
    keywords: ''
  });

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile filter is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('exploreFilters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFilters(prev => ({ ...prev, ...parsed }));
        setSearchQuery(parsed.keywords || '');
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage and notify parent
  useEffect(() => {
    const filtersToSave = { ...filters, keywords: searchQuery };
    localStorage.setItem('exploreFilters', JSON.stringify(filtersToSave));
    onFiltersChange(filtersToSave);
  }, [filters, searchQuery, onFiltersChange]);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleBreed = (breed: string) => {
    setFilters(prev => ({
      ...prev,
      breeds: prev.breeds.includes(breed)
        ? prev.breeds.filter(b => b !== breed)
        : [...prev.breeds, breed]
    }));
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      breeds: [],
      ageRange: [0, 10] as [number, number],
      gender: 'all' as 'all' | 'male' | 'female',
      location: '',
      priceRange: [0, 5000] as [number, number],
      sortBy: 'newest' as 'newest' | 'price_low' | 'price_high' | 'verified' | 'popular',
      verifiedOnly: false,
      healthTested: false,
      vaccinated: false,
      keywords: ''
    };
    setFilters(defaultFilters);
    setSearchQuery('');
    localStorage.removeItem('exploreFilters');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.breeds.length > 0) count++;
    if (filters.ageRange[0] > 0 || filters.ageRange[1] < 10) count++;
    if (filters.gender !== 'all') count++;
    if (filters.location) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) count++;
    if (filters.verifiedOnly) count++;
    if (filters.healthTested) count++;
    if (filters.vaccinated) count++;
    if (searchQuery) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const handleApplyFilters = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Filter content component - shared between desktop and mobile
  const FilterContent = () => (
    <>
      {/* Sort By */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Star className="w-4 h-4" />
          Sort By
        </label>
        <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
          <SelectTrigger className="w-full h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="verified">Verified Breeders Only</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Breeds - Two column grid on mobile */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Dog Breeds</label>
        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
          {DOG_BREEDS.map((breed) => (
            <div key={breed} className="flex items-center space-x-3 min-h-[44px]">
              <Checkbox
                id={`breed-${breed}`}
                checked={filters.breeds.includes(breed)}
                onCheckedChange={() => toggleBreed(breed)}
                className="h-5 w-5"
              />
              <label
                htmlFor={`breed-${breed}`}
                className="text-sm font-medium leading-none cursor-pointer flex-1"
              >
                {breed}
              </label>
            </div>
          ))}
        </div>
        {filters.breeds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.breeds.map(breed => (
              <Badge key={breed} variant="secondary" className="text-sm py-1 px-2">
                {breed}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => toggleBreed(breed)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Age Range */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years
        </label>
        <div className="px-2">
          <Slider
            value={filters.ageRange}
            onValueChange={(value) => updateFilter('ageRange', value as [number, number])}
            min={0}
            max={15}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 years</span>
            <span>15 years</span>
          </div>
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Gender</label>
        <Select value={filters.gender} onValueChange={(value) => updateFilter('gender', value)}>
          <SelectTrigger className="w-full h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location
        </label>
        <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Select state..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="all">All Locations</SelectItem>
            {US_STATES.map(state => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Price Range: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
        </label>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
            min={0}
            max={10000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>$10,000</span>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="space-y-4">
        <label className="text-sm font-medium flex items-center gap-2">
          <Award className="w-4 h-4" />
          Quick Filters
        </label>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 min-h-[44px]">
            <Checkbox
              id="verified"
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) => updateFilter('verifiedOnly', checked)}
              className="h-5 w-5"
            />
            <label htmlFor="verified" className="text-sm font-medium cursor-pointer">
              Verified Breeders Only
            </label>
          </div>
          <div className="flex items-center space-x-3 min-h-[44px]">
            <Checkbox
              id="healthTested"
              checked={filters.healthTested}
              onCheckedChange={(checked) => updateFilter('healthTested', checked)}
              className="h-5 w-5"
            />
            <label htmlFor="healthTested" className="text-sm font-medium cursor-pointer">
              Health Tested
            </label>
          </div>
          <div className="flex items-center space-x-3 min-h-[44px]">
            <Checkbox
              id="vaccinated"
              checked={filters.vaccinated}
              onCheckedChange={(checked) => updateFilter('vaccinated', checked)}
              className="h-5 w-5"
            />
            <label htmlFor="vaccinated" className="text-sm font-medium cursor-pointer">
              Vaccinated
            </label>
          </div>
        </div>
      </div>
    </>
  );

  // Mobile Bottom Sheet
  const MobileFilterSheet = () => (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Bottom Sheet */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          maxHeight: '90vh',
          paddingBottom: 'env(safe-area-inset-bottom, 20px)'
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearAllFilters}
                className="text-sm font-medium text-blue-600"
              >
                Reset
              </button>
            )}
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 -mr-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div 
          className="overflow-y-auto px-5 py-5 space-y-6"
          style={{ maxHeight: 'calc(90vh - 160px)' }}
        >
          <FilterContent />
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t px-5 py-4 flex gap-3">
          <Button 
            variant="outline" 
            onClick={clearAllFilters}
            className="flex-1 h-12 text-base font-medium"
          >
            Clear All
          </Button>
          <Button 
            onClick={handleApplyFilters}
            className="flex-1 h-12 text-base font-medium"
            style={{ backgroundColor: '#0074d4' }}
          >
            Apply Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-white text-blue-600 hover:bg-white">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </>
  );

  // Desktop layout - Full width grid
  const DesktopFilters = () => (
    <div className={className}>
      {/* Search Bar Row */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by keywords, breed, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              className="relative"
              onClick={() => setIsOpen(!isOpen)}
              style={{
                backgroundColor: isOpen ? '#0074d4' : '#ffffff',
                color: isOpen ? '#ffffff' : '#374151',
                borderColor: '#0074d4'
              }}
            >
              <Filter className="w-4 h-4 mr-2" style={{ color: isOpen ? '#ffffff' : '#0074d4' }} />
              {isOpen ? 'Hide Filters' : 'Show Filters'}
              {activeFiltersCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Full Width Filter Grid */}
      {isOpen && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            {/* Filter Grid - 4 columns on large screens, 2 on medium */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-600" />
                  Sort By
                </label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="verified">Verified Breeders Only</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select value={filters.gender} onValueChange={(value) => updateFilter('gender', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Location
                </label>
                <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select state..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="all">All Locations</SelectItem>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  Quick Filters
                </label>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={filters.verifiedOnly ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
                    style={filters.verifiedOnly ? { backgroundColor: '#0074d4' } : {}}
                  >
                    Verified
                  </Badge>
                  <Badge 
                    variant={filters.healthTested ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => updateFilter('healthTested', !filters.healthTested)}
                    style={filters.healthTested ? { backgroundColor: '#0074d4' } : {}}
                  >
                    Health Tested
                  </Badge>
                  <Badge 
                    variant={filters.vaccinated ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => updateFilter('vaccinated', !filters.vaccinated)}
                    style={filters.vaccinated ? { backgroundColor: '#0074d4' } : {}}
                  >
                    Vaccinated
                  </Badge>
                </div>
              </div>
            </div>

            {/* Second Row - Breeds and Sliders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Breeds - Takes 1 column */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Dog Breeds</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {DOG_BREEDS.map((breed) => (
                    <div key={breed} className="flex items-center space-x-2">
                      <Checkbox
                        id={`desktop-${breed}`}
                        checked={filters.breeds.includes(breed)}
                        onCheckedChange={() => toggleBreed(breed)}
                      />
                      <label
                        htmlFor={`desktop-${breed}`}
                        className="text-xs font-medium leading-none cursor-pointer"
                      >
                        {breed}
                      </label>
                    </div>
                  ))}
                </div>
                {filters.breeds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.breeds.map(breed => (
                      <Badge key={breed} variant="secondary" className="text-xs">
                        {breed}
                        <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleBreed(breed)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Age Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years
                </label>
                <div className="px-2 pt-4">
                  <Slider
                    value={filters.ageRange}
                    onValueChange={(value) => updateFilter('ageRange', value as [number, number])}
                    min={0}
                    max={15}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0 years</span>
                    <span>15 years</span>
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Price Range: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
                </label>
                <div className="px-2 pt-4">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                    min={0}
                    max={10000}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>$0</span>
                    <span>$10,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            {activeFiltersCount > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                  </span>
                  <span className="text-xs text-blue-800 ml-2">
                    Filters are automatically saved
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Mobile layout
  const MobileFilters = () => (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Filter Button */}
          <Button 
            variant="outline" 
            className="relative h-11 px-4"
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: '#ffffff',
              color: '#374151',
              borderColor: '#d1d5db'
            }}
          >
            <Filter className="w-4 h-4 mr-2" style={{ color: '#0074d4' }} />
            Filters
            {activeFiltersCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                style={{ backgroundColor: '#0074d4' }}
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Mobile Bottom Sheet */}
      <MobileFilterSheet />
    </Card>
  );

  return isMobile ? <MobileFilters /> : <DesktopFilters />;
};

export default AdvancedFilters;
