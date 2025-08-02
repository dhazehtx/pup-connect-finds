import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'wouter';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ListingCard from '@/components/ListingCard';
import EmptyState from '@/components/EmptyState';
import { Search, Filter, CheckSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlobalSearch from '@/components/GlobalSearch';
import { COMPONENTS, buildCardClass } from '@/styles/constants';

// Advanced Filters Panel Component
const AdvancedFilters = () => (
  <div className="mb-8 bg-gray-50 rounded-lg p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
      <Button variant="ghost" className="text-gray-600 text-sm">Clear All</Button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
        <Select defaultValue="newest">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Breed */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
        <Select defaultValue="all-breeds">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-breeds">All Breeds</SelectItem>
            <SelectItem value="french-bulldog">French Bulldog</SelectItem>
            <SelectItem value="golden-retriever">Golden Retriever</SelectItem>
            <SelectItem value="labrador">Labrador</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Source */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
        <Select defaultValue="all-sources">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-sources">All Sources</SelectItem>
            <SelectItem value="breeder">Breeder</SelectItem>
            <SelectItem value="rescue">Rescue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Age Group */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
        <Select defaultValue="all-ages">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-ages">All Ages</SelectItem>
            <SelectItem value="puppy">Puppy (0-1 year)</SelectItem>
            <SelectItem value="young">Young (1-3 years)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <Select defaultValue="all-genders">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-genders">All Genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <Select defaultValue="all-colors">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-colors">All Colors</SelectItem>
            <SelectItem value="black">Black</SelectItem>
            <SelectItem value="brown">Brown</SelectItem>
            <SelectItem value="white">White</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    {/* Price Range */}
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Price Range: $0 - $10000</label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input placeholder="0" className="text-sm" />
        </div>
        <div>
          <Input placeholder="10000" className="text-sm" />
        </div>
      </div>
    </div>
    
    {/* Age Range */}
    <div className="mt-6 grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Min Age (weeks)</label>
        <Input placeholder="0" className="text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Max Age (weeks)</label>
        <Input placeholder="104" className="text-sm" />
      </div>
    </div>
    
    {/* Checkboxes */}
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="verified" className="rounded border-gray-300" />
        <label htmlFor="verified" className="text-sm text-gray-600">Verified only</label>
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="available" className="rounded border-gray-300" />
        <label htmlFor="available" className="text-sm text-gray-600">Available now</label>
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="health-checked" className="rounded border-gray-300" />
        <label htmlFor="health-checked" className="text-sm text-gray-600">Health checked</label>
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="vaccinated" className="rounded border-gray-300" />
        <label htmlFor="vaccinated" className="text-sm text-gray-600">Vaccinated</label>
      </div>
    </div>
  </div>
);

// Search & Filter Component
const SearchAndFilters = ({ showAdvanced, setShowAdvanced }: { showAdvanced: boolean, setShowAdvanced: (show: boolean) => void }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-900">Search & Filter</h2>
      <Button 
        variant="ghost" 
        className="text-blue-600 font-medium"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        <Filter className="w-4 h-4 mr-2" />
        Advanced Filters
      </Button>
    </div>
    
    <div className="flex gap-4 items-center">
      <div className="flex-1 max-w-sm">
        <GlobalSearch 
          placeholder="Search puppies..." 
          className="w-full"
        />
      </div>
      
      <Select defaultValue="all-breeds">
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-breeds">All Breeds</SelectItem>
          <SelectItem value="golden-retriever">Golden Retriever</SelectItem>
          <SelectItem value="labrador">Labrador</SelectItem>
          <SelectItem value="french-bulldog">French Bulldog</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="flex items-center gap-2">
        <CheckSquare className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">Verified only</span>
      </div>
      
      <Button variant="ghost" className="text-gray-600">
        <Filter className="w-4 h-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  </div>
);

// Popular Breeds Component
const PopularBreeds = () => {
  const breeds = [
    "Golden Retriever", "Labrador Retriever", "German Shepherd", 
    "French Bulldog", "Bulldog", "Poodle", "Beagle", "Rottweiler"
  ];
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Breeds</h2>
      <div className="flex flex-wrap gap-2">
        {breeds.map((breed) => (
          <Button
            key={breed}
            variant="outline"
            size="sm"
            className="text-sm text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            {breed}
          </Button>
        ))}
      </div>
    </div>
  );
};

// Demo data for unauthenticated users
const demoListings = [
  {
    id: 'demo-1',
    dog_name: 'Demo Puppy',
    breed: 'Golden Retriever', 
    age: 8,
    price: '1500',
    location: 'Demo City',
    description: 'This is demo data. Sign in to see real listings!',
    image_url: null
  },
  {
    id: 'demo-2',
    dog_name: 'Demo Dog',
    breed: 'Labrador',
    age: 12,
    price: '1200', 
    location: 'Demo Town',
    description: 'Sign in to view real listings from breeders and rescues.',
    image_url: null
  }
];

const Explore = () => {
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Check if user is authenticated
  const isAuthenticated = !!user && !authLoading;

  const fetchRealListings = async (userId: string) => {
    console.log('[EXPLORE CLEAN] Fetching real listings from Supabase for user:', userId);
    console.log('[EXPLORE CLEAN] User ID type:', typeof userId, 'Length:', userId?.length);
    
    try {
      // Fetch directly from Supabase dog_listings table
      const { data, error } = await supabase
        .from('dog_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[EXPLORE CLEAN] Supabase error:', error);
        return [];
      }

      console.log('[EXPLORE CLEAN] Supabase listings fetched:', data?.length || 0);
      console.log('[EXPLORE CLEAN] Raw Supabase response:', data);
      
      // Show all listings (not just user's own) for marketplace experience
      if (data && data.length > 0) {
        const userOwnedListings = data.filter((listing: any) => listing.user_id === userId);
        console.log('[EXPLORE CLEAN] User\'s own listings:', userOwnedListings.length, 'out of', data.length);
        console.log('[EXPLORE CLEAN] Found listings by names:', data.map((l: any) => l.dog_name));
      }
      
      return data || [];
    } catch (error) {
      console.error('[EXPLORE CLEAN] Error fetching from Supabase:', error);
      return [];
    }
  };

  useEffect(() => {
    console.log('[EXPLORE CLEAN] Auth state:', { isAuthenticated, userId: user?.id, authLoading });
    
    if (authLoading) {
      // Still loading auth state
      return;
    }

    if (isAuthenticated && user?.id) {
      console.log('[EXPLORE CLEAN] User authenticated - fetching real listings');
      fetchRealListings(user.id)
        .then(setListings)
        .catch((error) => {
          console.error('[EXPLORE CLEAN] Error fetching real listings:', error);
          setListings([]);
        })
        .finally(() => setLoading(false));
    } else {
      console.log('[EXPLORE CLEAN] User not authenticated - showing demo listings');
      setLoading(false);
      setListings(demoListings); // only when not signed in
    }
  }, [isAuthenticated, user?.id, authLoading]);

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

  // Show demo content for unauthenticated users
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Puppies</h1>
            <p className="text-gray-600">Find your perfect furry companion</p>
          </div>
          
          {/* Search & Filter Section */}
          <SearchAndFilters showAdvanced={showAdvancedFilters} setShowAdvanced={setShowAdvancedFilters} />
          
          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="transition-all duration-300">
              <AdvancedFilters />
            </div>
          )}
          
          {/* Popular Breeds */}
          <PopularBreeds />
          
          {/* Results Count */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">0 Puppies Found</h2>
          </div>
          
          {/* Empty State */}
          <div className="text-center py-16">
            <div className="mb-6 mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No puppies found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search filters to find more puppies.</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show real listings for authenticated users
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Puppies</h1>
          <p className="text-gray-600">Find your perfect furry companion</p>
        </div>
        
        {/* Search & Filter Section */}
        <SearchAndFilters showAdvanced={showAdvancedFilters} setShowAdvanced={setShowAdvancedFilters} />
        
        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="transition-all duration-300">
            <AdvancedFilters />
          </div>
        )}
        
        {/* Popular Breeds */}
        <PopularBreeds />
        
        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {loading ? "Loading..." : `${listings?.length || 0} Puppies Found`}
          </h2>
        </div>
        
        {/* Listings Grid */}
        <RealListings data={listings} loading={loading} />
      </div>
    </div>
  );
};

// Demo listings component with responsive grid
const DemoListings = ({ data }: { data: any[] }) => (
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {data?.map((listing) => (
      <Card key={listing.id} className="hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300">
        <CardContent className="p-4">
          <div className="mb-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Demo Data
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2">{listing.dog_name}</h3>
          <p className="text-sm text-gray-600 mb-1">{listing.breed} • {listing.age} weeks</p>
          <p className="text-sm text-gray-600 mb-2">{listing.location}</p>
          <p className="text-xl font-bold text-green-600 mb-2">${listing.price}</p>
          <p className="text-sm text-gray-500">{listing.description}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Skeleton Grid Component for loading state
const SkeletonGrid = ({ count = 8 }: { count?: number }) => (
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <div className="aspect-[4/3] bg-gray-200 rounded-t-lg" />
        <CardContent className="p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Real listings component with Facebook-Marketplace-style responsive grid
const RealListings = ({ data, loading }: { data: any[], loading: boolean }) => {
  if (loading) {
    return <SkeletonGrid count={8} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-6 mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No puppies found</h3>
        <p className="text-gray-600 mb-6">Try adjusting your search filters to find more puppies.</p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
          Clear All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((listing) => {
        // Transform Supabase data to match ListingCard expected format
        const transformedListing = {
          ...listing,
          name: listing.dog_name || listing.name,
          images: listing.image_url ? [listing.image_url] : (listing.images || []),
          user_id: listing.user_id
        };
        return <ListingCard key={listing.id} listing={transformedListing} />;
      })}
    </div>
  );
};

export default Explore;