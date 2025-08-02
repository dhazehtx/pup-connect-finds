import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useLocation } from 'wouter';
import LoadingSpinner from '@/components/ui/loading-spinner';

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
    console.log('[EXPLORE CLEAN] Fetching real listings for user:', userId);
    console.log('[EXPLORE CLEAN] User ID type:', typeof userId, 'Length:', userId?.length);
    const response = await apiRequest('listings');
    console.log('[EXPLORE CLEAN] Real listings fetched:', response?.length || 0);
    console.log('[EXPLORE CLEAN] Raw listings response:', response);
    
    // Filter to show only this user's listings for debugging
    if (response && response.length > 0) {
      const userListings = response.filter(listing => listing.user_id === userId);
      console.log('[EXPLORE CLEAN] User\'s own listings:', userListings.length, 'out of', response.length);
      console.log('[EXPLORE CLEAN] First listing owner ID:', response[0]?.user_id, 'vs user ID:', userId);
    }
    
    return response || [];
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Demo Listings</h1>
            <p className="text-gray-600">Sign in to see real listings from breeders and rescues</p>
          </div>
          
          <DemoListings data={listings} />
          
          <div className="mt-8 text-center">
            <Button 
              onClick={() => window.location.href = '/auth'}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sign in to see real listings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show real listings for authenticated users
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Real Listings</h1>
          <p className="text-gray-600">Discover dogs from verified breeders and rescues</p>
        </div>
        
        <RealListings data={listings} loading={loading} />
      </div>
    </div>
  );
};

// Demo listings component
const DemoListings = ({ data }: { data: any[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

// Real listings component  
const RealListings = ({ data, loading }: { data: any[], loading: boolean }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Loading real listings...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No listings found. Be the first to post!</p>
        <Button className="mt-4" onClick={() => window.location.href = '/create-listing'}>
          Create Listing
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((listing) => (
        <Card key={listing.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="mb-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Real Listing
              </Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2">{listing.dog_name}</h3>
            <p className="text-sm text-gray-600 mb-1">{listing.breed} • {listing.age} weeks</p>
            <p className="text-sm text-gray-600 mb-2">{listing.location}</p>
            <p className="text-xl font-bold text-green-600 mb-2">${listing.price}</p>
            {listing.description && (
              <p className="text-sm text-gray-500">{listing.description}</p>
            )}
            {listing.vaccinated && (
              <Badge variant="outline" className="mt-2">
                Vaccinated
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Explore;