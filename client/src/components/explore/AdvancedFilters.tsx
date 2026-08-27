import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Filter,
  X,
  ChevronDown,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  Star,
  Dog,
  Home,
  Navigation,
  Clock,
} from 'lucide-react';
import {
  ExploreUniversalSearchBar,
  DEFAULT_EXPLORE_TRENDING,
  type ExploreTrendingItem,
} from '@/components/explore/ExploreUniversalSearchBar';
import { cn } from '@/lib/utils';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
  className?: string;
  /** Exposes clear-all for empty-state “Reset all filters” on Explore */
  clearFiltersRef?: React.MutableRefObject<(() => void) | null>;
}

const GOLDEN_RETRIEVER = 'Golden Retriever';

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
  className = '',
  clearFiltersRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    breeds: [] as string[],
    ageRange: [0, 10] as [number, number],
    ageCategory: '' as '' | 'puppy' | 'young' | 'adult',
    size: [] as string[],
    gender: 'all' as 'all' | 'male' | 'female',
    location: '',
    distanceRadius: '' as '' | '25' | '50' | '100' | 'local',
    priceRange: [0, 5000] as [number, number],
    sortBy: 'newest' as 'newest' | 'price_low' | 'price_high' | 'verified' | 'popular',
    verifiedOnly: false,
    healthTested: false,
    vaccinated: false,
    breederType: [] as string[],
    availability: '' as '' | 'available' | 'coming_soon' | 'reserved',
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

  // Load saved STRUCTURED filters from localStorage on mount. Intentionally does
  // NOT restore the search keywords — a transient search should never persist and
  // strand a returning user on a stale query with zero results.
  useEffect(() => {
    const savedFilters = localStorage.getItem('exploreFilters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters) || {};
        delete parsed.keywords; // never restore a stale search term
        setFilters(prev => ({ ...prev, ...parsed }));
        // searchQuery intentionally starts empty on every fresh mount.
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  // Notify the parent with the full selection (incl. the live search text), but
  // PERSIST only the structured filters — never the transient keywords.
  useEffect(() => {
    localStorage.setItem('exploreFilters', JSON.stringify({ ...filters }));
    onFiltersChange({ ...filters, keywords: searchQuery });
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

  const clearAllFilters = useCallback(() => {
    const defaultFilters = {
      breeds: [],
      ageRange: [0, 10] as [number, number],
      ageCategory: '' as '' | 'puppy' | 'young' | 'adult',
      size: [] as string[],
      gender: 'all' as 'all' | 'male' | 'female',
      location: '',
      distanceRadius: '' as '' | '25' | '50' | '100' | 'local',
      priceRange: [0, 5000] as [number, number],
      sortBy: 'newest' as 'newest' | 'price_low' | 'price_high' | 'verified' | 'popular',
      verifiedOnly: false,
      healthTested: false,
      vaccinated: false,
      breederType: [] as string[],
      availability: '' as '' | 'available' | 'coming_soon' | 'reserved',
      keywords: '',
    };
    setFilters(defaultFilters);
    setSearchQuery('');
    localStorage.removeItem('exploreFilters');
  }, []);

  useEffect(() => {
    if (!clearFiltersRef) return;
    clearFiltersRef.current = clearAllFilters;
    return () => {
      clearFiltersRef.current = null;
    };
  }, [clearFiltersRef, clearAllFilters]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.breeds.length > 0) count++;
    if (filters.ageRange[0] > 0 || filters.ageRange[1] < 10) count++;
    if (filters.ageCategory) count++;
    if (filters.size.length > 0) count++;
    if (filters.gender !== 'all') count++;
    if (filters.location) count++;
    if (filters.distanceRadius) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) count++;
    if (filters.verifiedOnly) count++;
    if (filters.healthTested) count++;
    if (filters.vaccinated) count++;
    if (filters.breederType.length > 0) count++;
    if (filters.availability) count++;
    if (searchQuery) count++;
    return count;
  };

  // Helper for age category selection
  const selectAgeCategory = (category: '' | 'puppy' | 'young' | 'adult') => {
    let newRange: [number, number] = [0, 10];
    if (category === 'puppy') newRange = [0, 1];
    else if (category === 'young') newRange = [1, 3];
    else if (category === 'adult') newRange = [3, 15];
    
    setFilters(prev => ({
      ...prev,
      ageCategory: prev.ageCategory === category ? '' : category,
      ageRange: prev.ageCategory === category ? [0, 10] : newRange
    }));
  };

  // Helper for size toggle
  const toggleSize = (size: string) => {
    setFilters(prev => ({
      ...prev,
      size: prev.size.includes(size)
        ? prev.size.filter(s => s !== size)
        : [...prev.size, size]
    }));
  };

  // Helper for breeder type toggle
  const toggleBreederType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      breederType: prev.breederType.includes(type)
        ? prev.breederType.filter(t => t !== type)
        : [...prev.breederType, type]
    }));
  };

  const activeFiltersCount = getActiveFiltersCount();

  const nearbyActive =
    filters.distanceRadius === '25' || filters.distanceRadius === 'local';
  const newestActive = filters.sortBy === 'newest';
  const goldenActive = filters.breeds.includes(GOLDEN_RETRIEVER);
  const smallActive = filters.size.includes('Small');

  const toggleQuickNearby = () => {
    setFilters((prev) => {
      const on = prev.distanceRadius === '25' || prev.distanceRadius === 'local';
      return { ...prev, distanceRadius: on ? ('' as const) : '25' };
    });
  };
  const toggleQuickNewest = () => {
    setFilters((prev) => ({
      ...prev,
      sortBy: prev.sortBy === 'newest' ? 'popular' : 'newest',
    }));
  };

  const quickFilterChips = (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Quick filters</p>
      <div
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
        role="group"
        aria-label="Quick filters"
      >
        {(
          [
            { id: 'nearby', label: 'Nearby', active: nearbyActive, onClick: toggleQuickNearby },
            { id: 'newest', label: 'Newest', active: newestActive, onClick: toggleQuickNewest },
            {
              id: 'golden',
              label: 'Golden Retrievers',
              active: goldenActive,
              onClick: () => toggleBreed(GOLDEN_RETRIEVER),
            },
            {
              id: 'small',
              label: 'Small breeds',
              active: smallActive,
              onClick: () => toggleSize('Small'),
            },
          ] as const
        ).map(({ id, label, active, onClick }) => (
          <button
            key={id}
            type="button"
            onClick={onClick}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'border-blue-200 bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  const handleApplyFilters = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleTrendingPick = useCallback((item: ExploreTrendingItem) => {
    if (item.kind === 'query') {
      setSearchQuery(item.query);
    } else {
      setSearchQuery('');
      setFilters((prev) => ({ ...prev, sortBy: item.sortBy }));
    }
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

      {/* Age Category - Pill Buttons */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Age Category
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'puppy', label: 'Puppy (0-1 yr)' },
            { value: 'young', label: 'Young (1-3 yrs)' },
            { value: 'adult', label: 'Adult (3+ yrs)' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => selectAgeCategory(value as 'puppy' | 'young' | 'adult')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                filters.ageCategory === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Age Range Slider */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years
        </label>
        <div className="px-2">
          <Slider
            value={filters.ageRange}
            onValueChange={(value) => {
              updateFilter('ageRange', value as [number, number]);
              updateFilter('ageCategory', '');
            }}
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

      {/* Size / Weight Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Dog className="w-4 h-4" />
          Size / Adult Weight
        </label>
        <div className="flex flex-wrap gap-2">
          {['Small', 'Medium', 'Large'].map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                filters.size.includes(size)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
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

      {/* Distance Radius */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Navigation className="w-4 h-4" />
          Distance
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: '25', label: '25 mi' },
            { value: '50', label: '50 mi' },
            { value: '100', label: '100 mi' },
            { value: 'local', label: 'Local Only' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateFilter('distanceRadius', filters.distanceRadius === value ? '' : value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                filters.distanceRadius === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
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

      {/* Breeder Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Home className="w-4 h-4" />
          Breeder Type
        </label>
        <div className="space-y-3">
          {[
            { value: 'verified', label: 'Verified Breeder' },
            { value: 'shelter', label: 'Shelter / Rescue' },
            { value: 'rehoming', label: 'Rehoming' }
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-3 min-h-[44px]">
              <Checkbox
                id={`breeder-${value}`}
                checked={filters.breederType.includes(value)}
                onCheckedChange={() => toggleBreederType(value)}
                className="h-5 w-5"
              />
              <label htmlFor={`breeder-${value}`} className="text-sm font-medium cursor-pointer">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Availability
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'available', label: 'Available Now' },
            { value: 'coming_soon', label: 'Coming Soon' },
            { value: 'reserved', label: 'Reserved' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateFilter('availability', filters.availability === value ? '' : value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                filters.availability === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
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
            className="flex-1 h-12 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
            style={{ backgroundColor: '#ffffff' }}
          >
            Clear All
          </Button>
          <Button 
            onClick={handleApplyFilters}
            className="flex-1 h-12 text-base font-medium text-white"
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
          <div className="explore-filters-toolbar flex flex-col gap-3 lg:flex-row lg:items-center">
            <ExploreUniversalSearchBar
              className="min-w-0 w-full lg:flex-1"
              value={searchQuery}
              onChange={setSearchQuery}
              trending={DEFAULT_EXPLORE_TRENDING}
              onTrendingPick={handleTrendingPick}
            />
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2.5 lg:pt-0">
              <Button
                variant="outline"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  backgroundColor: isOpen ? '#0074d4' : '#ffffff',
                  color: isOpen ? '#ffffff' : '#374151',
                  borderColor: '#0074d4',
                }}
              >
                <Filter className="mr-2 h-4 w-4" style={{ color: isOpen ? '#ffffff' : '#0074d4' }} />
                {isOpen ? 'Hide Filters' : 'Show Filters'}
                {activeFiltersCount > 0 && (
                  <Badge
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                    style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="mr-1 h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="border-t border-slate-100/90 pt-4 dark:border-slate-800">
          {quickFilterChips}
        </CardContent>
      </Card>

      {/* Full Width Filter Grid */}
      {isOpen && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            {/* Row 1: Sort, Gender, Location, Quick Filters */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
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

            {/* Row 2: two columns — age/size vs distance/availability */}
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-10">
              <div className="space-y-6">
                {/* Age Category */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Age Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'puppy', label: 'Puppy' },
                      { value: 'young', label: 'Young' },
                      { value: 'adult', label: 'Adult' },
                    ].map(({ value, label }) => (
                      <Badge
                        key={value}
                        variant={filters.ageCategory === value ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1"
                        onClick={() => selectAgeCategory(value as 'puppy' | 'young' | 'adult')}
                        style={filters.ageCategory === value ? { backgroundColor: '#0074d4' } : {}}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Dog className="h-4 w-4 text-blue-600" />
                    Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Small', 'Medium', 'Large'].map((size) => (
                      <Badge
                        key={size}
                        variant={filters.size.includes(size) ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1"
                        onClick={() => toggleSize(size)}
                        style={filters.size.includes(size) ? { backgroundColor: '#0074d4' } : {}}
                      >
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Distance */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    Distance
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '25', label: '25 mi' },
                      { value: '50', label: '50 mi' },
                      { value: '100', label: '100 mi' },
                      { value: 'local', label: 'Local' },
                    ].map(({ value, label }) => (
                      <Badge
                        key={value}
                        variant={filters.distanceRadius === value ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1"
                        onClick={() =>
                          updateFilter('distanceRadius', filters.distanceRadius === value ? '' : value)
                        }
                        style={filters.distanceRadius === value ? { backgroundColor: '#0074d4' } : {}}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Availability
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'available', label: 'Available' },
                      { value: 'coming_soon', label: 'Coming Soon' },
                      { value: 'reserved', label: 'Reserved' },
                    ].map(({ value, label }) => (
                      <Badge
                        key={value}
                        variant={filters.availability === value ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1"
                        onClick={() =>
                          updateFilter('availability', filters.availability === value ? '' : value)
                        }
                        style={filters.availability === value ? { backgroundColor: '#0074d4' } : {}}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Breeds & breeder — two columns; sliders full width row below */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-x-10">
              {/* Breeds */}
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

              {/* Breeder Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Home className="w-4 h-4 text-blue-600" />
                  Breeder Type
                </label>
                <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                  {[
                    { value: 'verified', label: 'Verified Breeder' },
                    { value: 'shelter', label: 'Shelter / Rescue' },
                    { value: 'rehoming', label: 'Rehoming' }
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`breeder-desktop-${value}`}
                        checked={filters.breederType.includes(value)}
                        onCheckedChange={() => toggleBreederType(value)}
                      />
                      <label
                        htmlFor={`breeder-desktop-${value}`}
                        className="text-xs font-medium leading-none cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Age Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Age: {filters.ageRange[0]} - {filters.ageRange[1]} yrs
                </label>
                <div className="px-2 pt-4">
                  <Slider
                    value={filters.ageRange}
                    onValueChange={(value) => {
                      updateFilter('ageRange', value as [number, number]);
                      updateFilter('ageCategory', '');
                    }}
                    min={0}
                    max={15}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0 yrs</span>
                    <span>15 yrs</span>
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
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
                    <span>$10k</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:justify-end sm:gap-3">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={clearAllFilters}>
                Clear All
              </Button>
              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
                onClick={() => setIsOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Mobile layout
  const MobileFilters = () => (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="explore-filters-toolbar flex items-center gap-2.5">
          <ExploreUniversalSearchBar
            className="min-w-0 flex-1"
            value={searchQuery}
            onChange={setSearchQuery}
            trending={DEFAULT_EXPLORE_TRENDING}
            onTrendingPick={handleTrendingPick}
          />

          {/* Filter Button - Icon only on mobile; height matches search bar */}
          <Button 
            variant="outline" 
            className="relative flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 items-center justify-center rounded-full border-slate-200 p-0"
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: '#ffffff',
              color: '#374151',
              borderColor: '#e2e8f0',
            }}
          >
            <Filter className="h-5 w-5 shrink-0 text-[#0074d4]" strokeWidth={2.25} aria-hidden />
            {activeFiltersCount > 0 && (
              <Badge 
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                style={{ backgroundColor: '#0074d4' }}
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="border-t border-slate-100/90 pt-4 dark:border-slate-800">{quickFilterChips}</CardContent>

      {/* Mobile Bottom Sheet */}
      <MobileFilterSheet />
    </Card>
  );

  // IMPORTANT: MobileFilters/DesktopFilters are defined inside this component, so
  // rendering them as <MobileFilters /> / <DesktopFilters /> makes React see a NEW
  // component type on every re-render and REMOUNT the whole subtree — which
  // destroyed the search input and dropped focus after each keystroke. Calling them
  // as plain functions inlines their JSX into THIS component's tree, so the input
  // is reconciled in place and keeps focus. (Neither contains hooks, so this is safe.)
  return isMobile ? MobileFilters() : DesktopFilters();
};

export default AdvancedFilters;
