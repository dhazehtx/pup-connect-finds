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
import SearchBar from '@/components/SearchBar';
import { COMPONENTS, buildCardClass, buildButtonClass } from '@/styles/constants';

// Simple Search & Filter Component - Matching screenshot layout exactly
const SimpleSearchAndFilters = () => (
  <div className="mb-6">
    {/* Search & Filter Header with Advanced Filters toggle */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
      <Button 
        variant="ghost" 
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <Filter className="w-4 h-4" />
        Advanced Filters
      </Button>
    </div>
    
    {/* Search Bar Row - exact layout from screenshot */}
    <div className="flex items-center gap-4">
      {/* Search Input */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search puppies..."
            className="pl-10 h-10 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* All Breeds Dropdown */}
      <Select defaultValue="all-breeds">
        <SelectTrigger className="w-40 h-10 border-gray-300 rounded-md">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-breeds">All Breeds</SelectItem>
          <SelectItem value="golden-retriever">Golden Retriever</SelectItem>
          <SelectItem value="labrador">Labrador</SelectItem>
          <SelectItem value="french-bulldog">French Bulldog</SelectItem>
          <SelectItem value="german-shepherd">German Shepherd</SelectItem>
          <SelectItem value="bulldog">Bulldog</SelectItem>
        </SelectContent>
      </Select>
      
      {/* Verified Only Checkbox */}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="verified-only" className="rounded border-gray-300" />
        <label htmlFor="verified-only" className="text-sm text-gray-700 whitespace-nowrap">Verified only</label>
      </div>
      
      {/* Clear Filters Button */}
      <Button 
        variant="ghost" 
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <Filter className="w-4 h-4" />
        Clear Filters
      </Button>
    </div>
  </div>
);



// Popular Breeds Component - Exact screenshot layout with pill buttons
const PopularBreeds = () => {
  const breeds = [
    "Golden Retriever", "Labrador Retriever", "German Shepherd", 
    "French Bulldog", "Bulldog", "Poodle", "Beagle", "Rottweiler"
  ];
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Breeds</h3>
      <div className="flex flex-wrap gap-3">
        {breeds.map((breed) => (
          <Badge
            key={breed}
            variant="outline"
            className="cursor-pointer text-sm text-gray-700 border-gray-300 hover:bg-gray-50 rounded-full px-4 py-2 font-normal"
          >
            {breed}
          </Badge>
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
          <SimpleSearchAndFilters />
          
          {/* Popular Breeds */}
          <PopularBreeds />
          
          {/* Results Count - Match screenshot format */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">0 Puppies Found</h2>
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
        <SimpleSearchAndFilters />
        
        {/* Popular Breeds */}
        <PopularBreeds />
        
        {/* Results Count - Match screenshot format */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
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
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {data.map((listing) => (
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
            {/* Price Badge - positioned like in screenshot */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                ${listing.price?.toLocaleString() || 'Contact'}
              </Badge>
            </div>
            {/* Heart Icon - positioned like in screenshot */}
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full w-8 h-8 p-0"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Button>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1 text-gray-900">{listing.dog_name}</h3>
            <p className="text-sm text-gray-600 mb-1">{listing.breed}</p>
            <p className="text-sm text-gray-600 mb-1">{listing.age} weeks old</p>
            <p className="text-sm text-gray-600">{listing.location}</p>
            {listing.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{listing.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Explore;