import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MapPin, Grid, List } from 'lucide-react';
import AdvancedFilters from '@/components/explore/AdvancedFilters';
import LoadingSpinner from '@/components/ui/loading-spinner';

// Local demo puppy images - guaranteed to render
import goldenRetrieverImg from '@assets/image_1768789113456.png';
import labradorImg from '@assets/image_1768789180374.png';
import germanShepherdImg from '@assets/image_1768789189271.png';
import frenchBulldogImg from '@assets/image_1768789197905.png';



// Fallback image for demo listings
const DEMO_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop";

// Demo listing card that matches real ListingCard but with guest-mode behavior
const GuestListingCard = ({ listing }: { listing: any }) => {
  const navigate = useNavigate();
  
  const handleSignIn = () => {
    navigate('/auth/sign-up');
  };

  // Get image URL with fallback chain
  const imageUrl = listing.image_url || listing.images?.[0] || DEMO_FALLBACK_IMAGE;

  return (
    <Card 
      className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white border border-gray-200"
      onClick={handleSignIn}
    >
      {/* Image container - square aspect ratio to show full puppy */}
      <div 
        className="relative w-full overflow-hidden bg-gray-100"
        style={{ 
          aspectRatio: '1 / 1'
        }}
      >
        <img
          src={imageUrl}
          alt={listing.dog_name || 'Puppy'}
          className="absolute inset-0 w-full h-full transition-transform duration-300 hover:scale-105"
          style={{ 
            objectFit: 'contain',
            objectPosition: 'center',
            backgroundColor: '#f3f4f6'
          }}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEMO_FALLBACK_IMAGE;
          }}
        />
        
        {/* Price badge - white background, black text for visibility */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
          <span 
            style={{ 
              backgroundColor: '#ffffff', 
              color: '#000000',
              display: 'inline-block',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            ${listing.price?.toLocaleString()}
          </span>
        </div>
        
        {/* Heart button - inline styles to prevent yellow on mobile */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-3 right-3 z-10 h-8 w-8 p-0 backdrop-blur-sm rounded-full"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.9)', 
            WebkitTapHighlightColor: 'transparent' 
          }}
          onClick={(e) => { e.stopPropagation(); handleSignIn(); }}
        >
          <Heart className="h-4 w-4" style={{ color: '#6b7280' }} />
        </Button>
      </div>
      
      {/* Card content */}
      <CardContent className="p-4 space-y-2 bg-white">
        <div>
          <h3 className="font-semibold text-base leading-tight text-gray-900">{listing.dog_name}</h3>
          <p className="text-sm text-gray-500">{listing.breed}</p>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{listing.age} weeks</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{listing.location}</span>
          </div>
        </div>
        
        <Button size="sm" className="w-full mt-2" onClick={handleSignIn}>
          Sign in to view
        </Button>
      </CardContent>
    </Card>
  );
};

const ExploreGuest = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<any>({});
  const [resultCount, setResultCount] = useState(0);

  // Debug logging - throttled to avoid excessive re-renders
  useEffect(() => {
    console.log('[EXPLORE GUEST] Component mounted');
  }, []);

  // Static demo data for guest users - uses LOCAL images for guaranteed rendering
  // CRITICAL: Uses imported local images, not external URLs
  const GUEST_DEMO_LISTINGS = [
    {
      id: "demo-1",
      dog_name: "Golden Retriever Puppy",
      breed: "Golden Retriever",
      age: 8,
      price: 1200,
      location: "Austin, TX",
      image_url: goldenRetrieverImg,
      isDemo: true
    },
    {
      id: "demo-2",
      dog_name: "Labrador Puppy", 
      breed: "Labrador Retriever",
      age: 10,
      price: 1000,
      location: "Los Angeles, CA",
      image_url: labradorImg,
      isDemo: true
    },
    {
      id: "demo-3",
      dog_name: "German Shepherd Puppy",
      breed: "German Shepherd", 
      age: 12,
      price: 1500,
      location: "Chicago, IL",
      image_url: germanShepherdImg,
      isDemo: true
    },
    {
      id: "demo-4",
      dog_name: "French Bulldog Puppy",
      breed: "French Bulldog",
      age: 9,
      price: 2500,
      location: "New York, NY",
      image_url: frenchBulldogImg,
      isDemo: true
    }
  ];

  // Use static data - no network request needed for guests
  const listings = GUEST_DEMO_LISTINGS;
  const loadingListings = false;

  // Update result count when listings change
  useEffect(() => {
    setResultCount(listings.length || 0);
  }, [listings]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="min-h-screen pb-20 explore-guest-page" data-page="explore" style={{ backgroundColor: '#ffffff' }}>
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">
                Discover puppies and find your perfect companion
              </p>
            </div>
            
            {/* View Toggle - inline styles to prevent mobile color drift */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-1.5 min-h-[40px]"
                style={{
                  backgroundColor: viewMode === 'grid' ? '#0074d4' : '#ffffff',
                  color: viewMode === 'grid' ? '#ffffff' : '#374151',
                  borderColor: viewMode === 'grid' ? '#0074d4' : '#d1d5db'
                }}
              >
                <Grid className="h-4 w-4" style={{ color: 'inherit' }} />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-1.5 min-h-[40px]"
                style={{
                  backgroundColor: viewMode === 'list' ? '#0074d4' : '#ffffff',
                  color: viewMode === 'list' ? '#ffffff' : '#374151',
                  borderColor: viewMode === 'list' ? '#0074d4' : '#d1d5db'
                }}
              >
                <List className="h-4 w-4" style={{ color: 'inherit' }} />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <AdvancedFilters onFiltersChange={handleFiltersChange} />
      </div>

      {/* Puppy Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Puppy Listings</h2>
            
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
              {resultCount} results found
            </div>
          </div>

          <div className="space-y-6">
            {loadingListings ? (
              <LoadingSpinner />
            ) : listings && listings.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" style={{ backgroundColor: 'transparent' }}>
                {listings.map((listing) => (
                  <GuestListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No listings found matching your criteria.</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExploreGuest;