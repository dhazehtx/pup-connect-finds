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
}

// Supabase-Powered FilterBar Component with breed dropdown from database
const FilterBarWithSupabase: React.FC<FilterBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  selectedBreed, 
  onBreedChange,
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
  const [loadingBreeds, setLoadingBreeds] = useState(true);

  // Fetch all 50 popular breeds from Supabase
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const { data: breeds, error } = await supabase
          .from('breeds' as any)
          .select('name')
          .order('popularity_rank', { ascending: true })
          .limit(50) as { data: Breed[] | null; error: any };
        
        if (error) {
          console.error('Error fetching breeds:', error);
          // If breeds table doesn't exist, use the full 50 popular breeds list
          const popularBreeds: Breed[] = [
            { name: 'Labrador Retriever' },
            { name: 'Golden Retriever' },
            { name: 'German Shepherd' },
            { name: 'French Bulldog' },
            { name: 'Bulldog' },
            { name: 'Poodle' },
            { name: 'Beagle' },
            { name: 'Rottweiler' },
            { name: 'Yorkshire Terrier' },
            { name: 'German Shorthaired Pointer' },
            { name: 'Siberian Husky' },
            { name: 'Dachshund' },
            { name: 'Pembroke Welsh Corgi' },
            { name: 'Australian Shepherd' },
            { name: 'Boston Terrier' },
            { name: 'Bernese Mountain Dog' },
            { name: 'Boxer' },
            { name: 'Cocker Spaniel' },
            { name: 'Border Collie' },
            { name: 'Great Dane' },
            { name: 'Pomeranian' },
            { name: 'Shih Tzu' },
            { name: 'Mastiff' },
            { name: 'Chihuahua' },
            { name: 'Brittany' },
            { name: 'Shetland Sheepdog' },
            { name: 'Belgian Malinois' },
            { name: 'Weimaraner' },
            { name: 'Miniature Schnauzer' },
            { name: 'Cavalier King Charles Spaniel' },
            { name: 'Doberman Pinscher' },
            { name: 'Australian Cattle Dog' },
            { name: 'Cane Corso' },
            { name: 'Collie' },
            { name: 'Rhodesian Ridgeback' },
            { name: 'Newfoundland' },
            { name: 'West Highland White Terrier' },
            { name: 'Saint Bernard' },
            { name: 'Bloodhound' },
            { name: 'Bull Terrier' },
            { name: 'Basset Hound' },
            { name: 'Bichon Frise' },
            { name: 'Akita' },
            { name: 'Portuguese Water Dog' },
            { name: 'Whippet' },
            { name: 'Alaskan Malamute' },
            { name: 'Scottish Terrier' },
            { name: 'Australian Terrier' },
            { name: 'Chinese Shar-Pei' },
            { name: 'Vizsla' }
          ];
          setBreeds(popularBreeds);
          return;
        }
        
        setBreeds(breeds || []);
      } catch (error) {
        console.error('Error fetching breeds:', error);
      } finally {
        setLoadingBreeds(false);
      }
    };

    fetchBreeds();
  }, []);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Search Input Row */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search puppies..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Breed Filter - Supabase powered */}
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
                    {breed.name}
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

// Popular Breeds Component
const PopularBreedsComponent: React.FC<{ onBreedSelect: (breed: string) => void }> = ({ onBreedSelect }) => {
  const popularBreeds = [
    'Golden Retriever', 'Labrador Retriever', 'German Shepherd',
    'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler'
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Popular Breeds</h3>
        <div className="flex flex-wrap gap-2">
          {popularBreeds.map((breed) => (
            <Badge
              key={breed}
              variant="outline"
              className="cursor-pointer hover:bg-gray-50 px-3 py-1"
              onClick={() => onBreedSelect(breed)}
            >
              {breed}
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
  location: string;
  description?: string;
  image_url?: string;
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
              {listing.location}
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
  const [ageRange, setAgeRange] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

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
  }, [selectedBreed, ageRange, selectedGender, priceRange, verifiedOnly, searchTerm, authLoading]);

  // Show loading while auth is resolving
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Loading explore page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore</h1>
          <p className="text-gray-600">Find your perfect furry companion</p>
        </div>

        {/* Supabase-Powered Filter Bar */}
        <FilterBarWithSupabase
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedBreed={selectedBreed}
          onBreedChange={setSelectedBreed}
          ageRange={ageRange}
          onAgeChange={setAgeRange}
          selectedGender={selectedGender}
          onGenderChange={setSelectedGender}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          verifiedOnly={verifiedOnly}
          onVerifiedChange={setVerifiedOnly}
        />

        {/* Popular Breeds */}
        <PopularBreedsComponent onBreedSelect={setSelectedBreed} />

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