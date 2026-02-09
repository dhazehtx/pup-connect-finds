import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Search,
  Filter,
  Heart,
  MapPin
} from 'lucide-react';

// Types for FilterBar props
interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedBreed: string;
  onBreedChange: (value: string) => void;
  selectedColor: string;
  onColorChange: (value: string) => void;
  ageRange: string;
  onAgeChange: (value: string) => void;
  selectedGender: string;
  onGenderChange: (value: string) => void;
  priceRange: number[];
  onPriceChange: (value: number[]) => void;
  verifiedOnly: boolean;
  onVerifiedChange: (value: boolean) => void;
}

interface Breed {
  name: string;
  color?: string;
}

interface Color {
  name: string;
  hex: string;
}

// Supabase-Powered FilterBar Component with breed and color dropdowns
const FilterBarWithSupabase: React.FC<FilterBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  selectedBreed, 
  onBreedChange,
  selectedColor,
  onColorChange,
  ageRange,
  onAgeChange,
  selectedGender,
  onGenderChange,
  priceRange,
  onPriceChange,
  verifiedOnly,
  onVerifiedChange 
}) => {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loadingBreeds, setLoadingBreeds] = useState(true);
  const [loadingColors, setLoadingColors] = useState(true);

  useEffect(() => {
    const popularBreedsWithColors: Breed[] = [
      { name: 'Labrador Retriever', color: '#F4D03F' },
      { name: 'Golden Retriever', color: '#F1C40F' },
      { name: 'German Shepherd', color: '#8D6E63' },
      { name: 'French Bulldog', color: '#BDC3C7' },
      { name: 'Bulldog', color: '#ECF0F1' },
      { name: 'Poodle', color: '#F8C9D4' },
      { name: 'Beagle', color: '#F39C12' },
      { name: 'Rottweiler', color: '#2C3E50' },
      { name: 'Yorkshire Terrier', color: '#D4AC0D' },
      { name: 'German Shorthaired Pointer', color: '#A0522D' },
      { name: 'Siberian Husky', color: '#85C1E9' },
      { name: 'Dachshund', color: '#CB4335' },
      { name: 'Pembroke Welsh Corgi', color: '#E67E22' },
      { name: 'Australian Shepherd', color: '#5D6D7E' },
      { name: 'Boston Terrier', color: '#17202A' },
      { name: 'Bernese Mountain Dog', color: '#2C3E50' },
      { name: 'Boxer', color: '#D35400' },
      { name: 'Cocker Spaniel', color: '#A04000' },
      { name: 'Border Collie', color: '#2C3E50' },
      { name: 'Great Dane', color: '#566573' },
      { name: 'Pomeranian', color: '#F39C12' },
      { name: 'Shih Tzu', color: '#F4D03F' },
      { name: 'Mastiff', color: '#D4AC0D' },
      { name: 'Chihuahua', color: '#A04000' },
      { name: 'Brittany', color: '#E67E22' },
      { name: 'Shetland Sheepdog', color: '#8D6E63' },
      { name: 'Belgian Malinois', color: '#B7950B' },
      { name: 'Weimaraner', color: '#AEB6BF' },
      { name: 'Miniature Schnauzer', color: '#566573' },
      { name: 'Cavalier King Charles Spaniel', color: '#CB4335' },
      { name: 'Doberman Pinscher', color: '#2C3E50' },
      { name: 'Australian Cattle Dog', color: '#5D6D7E' },
      { name: 'Cane Corso', color: '#2C3E50' },
      { name: 'Collie', color: '#8D6E63' },
      { name: 'Rhodesian Ridgeback', color: '#D35400' },
      { name: 'Newfoundland', color: '#17202A' },
      { name: 'West Highland White Terrier', color: '#FDFEFE' },
      { name: 'Saint Bernard', color: '#CB4335' },
      { name: 'Bloodhound', color: '#A04000' },
      { name: 'Bull Terrier', color: '#FDFEFE' },
      { name: 'Basset Hound', color: '#F39C12' },
      { name: 'Bichon Frise', color: '#FDFEFE' },
      { name: 'Akita', color: '#E67E22' },
      { name: 'Portuguese Water Dog', color: '#2C3E50' },
      { name: 'Whippet', color: '#AEB6BF' },
      { name: 'Alaskan Malamute', color: '#566573' },
      { name: 'Scottish Terrier', color: '#17202A' },
      { name: 'Australian Terrier', color: '#D4AC0D' },
      { name: 'Chinese Shar-Pei', color: '#D35400' },
      { name: 'Vizsla', color: '#CB4335' }
    ];
    setBreeds(popularBreedsWithColors);
    setLoadingBreeds(false);
  }, []);

  // Fetch coat colors
  useEffect(() => {
    const fetchColors = async () => {
      try {
        // Try to fetch from Supabase colors table or use hardcoded list
        const coatColors: Color[] = [
          { name: 'Black', hex: '#2C3E50' },
          { name: 'White', hex: '#FDFEFE' },
          { name: 'Brown', hex: '#A04000' },
          { name: 'Golden', hex: '#F1C40F' },
          { name: 'Cream', hex: '#F4D03F' },
          { name: 'Gray', hex: '#566573' },
          { name: 'Silver', hex: '#AEB6BF' },
          { name: 'Fawn', hex: '#D35400' },
          { name: 'Red', hex: '#CB4335' },
          { name: 'Blue', hex: '#85C1E9' },
          { name: 'Brindle', hex: '#8D6E63' },
          { name: 'Merle', hex: '#5D6D7E' },
          { name: 'Sable', hex: '#B7950B' },
          { name: 'Tri-color', hex: '#E67E22' }
        ];
        setColors(coatColors);
      } catch (error) {
        console.error('Error fetching colors:', error);
      } finally {
        setLoadingColors(false);
      }
    };

    fetchColors();
  }, []);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Search Input Row */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search puppies, breeds, or breeders..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          {/* Breed Filter with Color Dots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
            <Select value={selectedBreed} onValueChange={onBreedChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={loadingBreeds ? "Loading..." : "All Breeds"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Breeds</SelectItem>
                {breeds.map((breed) => (
                  <SelectItem key={breed.name} value={breed.name}>
                    <div className="flex items-center gap-2">
                      {breed.color && (
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300" 
                          style={{ backgroundColor: breed.color }}
                        />
                      )}
                      {breed.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Filter with Swatches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <Select value={selectedColor} onValueChange={onColorChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={loadingColors ? "Loading..." : "All Colors"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                {colors.map((color) => (
                  <SelectItem key={color.name} value={color.name}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300" 
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age (weeks)</label>
            <Select value={ageRange} onValueChange={onAgeChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Any Age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Age</SelectItem>
                <SelectItem value="0-12">0-12 weeks</SelectItem>
                <SelectItem value="13-26">13-26 weeks</SelectItem>
                <SelectItem value="27-52">27-52 weeks</SelectItem>
                <SelectItem value="1+">1+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <Select value={selectedGender} onValueChange={onGenderChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Any Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Gender</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verified Only Toggle */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2 mt-6">
              <input
                type="checkbox"
                id="verified-only"
                checked={verifiedOnly}
                onChange={(e) => onVerifiedChange(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="verified-only" className="text-sm font-medium text-gray-700">
                Verified Only
              </label>
            </div>
          </div>
        </div>

        {/* Price Range Slider */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </label>
          <Slider
            value={priceRange}
            onValueChange={onPriceChange}
            max={10000}
            min={0}
            step={100}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Color-coded Popular Breeds Component
const PopularBreedsComponent: React.FC<{ 
  onBreedSelect: (breed: string, color?: string) => void;
  breeds: Breed[];
}> = ({ onBreedSelect, breeds }) => {
  // Top 10-12 most popular breeds for the bar
  const topBreeds = breeds.slice(0, 12);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Popular Breeds</h3>
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {topBreeds.map((breed) => (
            <Badge
              key={breed.name}
              variant="outline"
              className="cursor-pointer hover:opacity-80 px-3 py-1 border-none text-white font-medium whitespace-nowrap"
              style={{ 
                backgroundColor: breed.color || '#6B7280',
                color: breed.color === '#FDFEFE' || breed.color === '#E5E7EB' ? '#000000' : '#FFFFFF'
              }}
              onClick={() => onBreedSelect(breed.name, breed.color)}
            >
              {breed.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Listing Grid Component  
interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  location: string | null;
  description?: string | null;
  image_url?: string | null;
}

const ListingGrid: React.FC<{ listings: Listing[]; loading: boolean }> = ({ listings, loading }) => {
  if (loading) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-300 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-6 mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No puppies found</h3>
        <p className="text-gray-600 mb-6">Try adjusting your search filters to find more puppies.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <Card key={listing.id} className="hover:shadow-lg transition-shadow border border-gray-200 rounded-lg overflow-hidden">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={listing.image_url || '/placeholder.svg'}
              alt={listing.dog_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            {/* Price Badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                ${listing.price?.toLocaleString() || 'Contact'}
              </Badge>
            </div>
            {/* Heart Icon */}
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full w-8 h-8 p-0"
            >
              <Heart className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1 text-gray-900">{listing.dog_name}</h3>
            <p className="text-sm text-gray-600 mb-1">{listing.breed}</p>
            <p className="text-sm text-gray-600 mb-1">{listing.age} weeks old</p>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-3 h-3 mr-1" />
              {listing.location || 'Location not specified'}
            </div>
            {listing.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{listing.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Main Explore Component
const Explore = () => {
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [ageRange, setAgeRange] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  
  // Filters panel collapsed state with localStorage persistence
  const [filtersOpen, setFiltersOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('exploreFiltersOpen') === '1';
  });

  // Save filters state to localStorage
  useEffect(() => {
    localStorage.setItem('exploreFiltersOpen', filtersOpen ? '1' : '0');
  }, [filtersOpen]);

  // Remove inline import - icons should be imported at module level
  
  // Breeds data for popular breeds component
  const [breeds, setBreeds] = useState<Breed[]>([]);

  // Fetch breeds for popular breeds bar
  useEffect(() => {
    const popularBreedsWithColors: Breed[] = [
      { name: 'Labrador Retriever', color: '#F4D03F' },
      { name: 'Golden Retriever', color: '#F1C40F' },
      { name: 'German Shepherd', color: '#8D6E63' },
      { name: 'French Bulldog', color: '#BDC3C7' },
      { name: 'Bulldog', color: '#ECF0F1' },
      { name: 'Poodle', color: '#F8C9D4' },
      { name: 'Beagle', color: '#F39C12' },
      { name: 'Rottweiler', color: '#2C3E50' },
      { name: 'Yorkshire Terrier', color: '#D4AC0D' },
      { name: 'German Shorthaired Pointer', color: '#A0522D' },
      { name: 'Siberian Husky', color: '#85C1E9' },
      { name: 'Dachshund', color: '#CB4335' }
    ];
    setBreeds(popularBreedsWithColors);
  }, []);

  // Check if user is authenticated
  const isAuthenticated = !!user && !authLoading;

  // Fetch listings from Supabase with filters applied
  const fetchListings = async () => {
    try {
      console.log('[EXPLORE] Fetching listings from Supabase...');
      let query = supabase
        .from('dog_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters
      if (selectedBreed !== 'all') {
        query = query.eq('breed', selectedBreed);
      }

      if (selectedColor !== 'all') {
        query = query.eq('color', selectedColor);
      }
      
      if (selectedGender !== 'all') {
        query = query.eq('gender', selectedGender);
      }

      if (searchTerm) {
        query = query.or(`dog_name.ilike.%${searchTerm}%,breed.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      // Price filter
      query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);

      const { data, error } = await query;

      if (error) {
        console.error('[EXPLORE] Supabase error:', error);
        return;
      }

      console.log('[EXPLORE] Fetched listings:', data?.length || 0);
      setListings(data || []);
    } catch (error) {
      console.error('[EXPLORE] Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch listings when filters change
  useEffect(() => {
    if (!authLoading) {
      setLoading(true);
      fetchListings();
    }
  }, [selectedBreed, selectedColor, ageRange, selectedGender, priceRange, verifiedOnly, searchTerm, authLoading]);

  // Show loading while auth is resolving
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Loading explore page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore</h1>
          <p className="text-gray-600">Find your perfect furry companion</p>
        </div>

        {/* Color-coded Popular Breeds Bar */}
        <PopularBreedsComponent 
          onBreedSelect={(breed, color) => {
            setSelectedBreed(breed);
            if (color) {
              // Find the matching color name from our color list
              const colorNames = ['Black', 'Brown', 'Golden', 'Cream', 'Gray', 'Silver', 'Fawn', 'Red', 'Blue', 'White'];
              const colorHexMap = {
                '#2C3E50': 'Black', '#17202A': 'Black',
                '#A04000': 'Brown', '#8D6E63': 'Brown',
                '#F1C40F': 'Golden', '#D4AC0D': 'Golden',
                '#F4D03F': 'Cream', '#F39C12': 'Golden',
                '#566573': 'Gray', '#5D6D7E': 'Gray',
                '#AEB6BF': 'Silver', '#BDC3C7': 'Silver',
                '#D35400': 'Fawn', '#E67E22': 'Fawn',
                '#CB4335': 'Red',
                '#85C1E9': 'Blue',
                '#FDFEFE': 'White', '#ECF0F1': 'White'
              };
              const colorName = colorHexMap[color as keyof typeof colorHexMap];
              if (colorName) {
                setSelectedColor(colorName);
              }
            }
          }} 
          breeds={breeds || []}
        />

        {/* Basic Search Bar (always visible) */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by breed, name, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-base rounded-lg shadow-sm border focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Floating Filter Toggle Button */}
        <button
          className="fixed bottom-20 right-4 z-30 rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary shadow-md hover:shadow-lg transition-all"
          onClick={() => setFiltersOpen(v => !v)}
          aria-expanded={filtersOpen}
        >
          <Filter className="w-4 h-4 inline mr-2" />
          {filtersOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        {/* Advanced Filters Panel (collapsible) */}
        {filtersOpen && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <FilterBarWithSupabase
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedBreed={selectedBreed}
              onBreedChange={setSelectedBreed}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              ageRange={ageRange}
              onAgeChange={setAgeRange}
              selectedGender={selectedGender}
              onGenderChange={setSelectedGender}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              verifiedOnly={verifiedOnly}
              onVerifiedChange={setVerifiedOnly}
            />
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {loading ? "Loading..." : `${listings.length} Puppies Found`}
          </h2>
        </div>

        {/* Listings Grid */}
        <ListingGrid listings={listings} loading={loading} />
      </div>
    </div>
  );
};

export default Explore;