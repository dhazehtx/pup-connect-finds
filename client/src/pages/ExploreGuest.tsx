import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dog, Heart, MapPin } from 'lucide-react';
import AdvancedFilters from '@/components/explore/AdvancedFilters';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useDogListings } from '@/hooks/useDogListings';

// Neutral placeholder for listings that genuinely have no image (NOT fake inventory).
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%25' height='100%25' fill='%23f3f4f6'/></svg>";

// Guest listing card — shows a REAL public listing and opens the public detail page.
const GuestListingCard = ({ listing }: { listing: any }) => {
  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();

  // Viewing a listing is public (the /listing/:id route is not auth-gated), so open
  // the real detail page. Actions that mutate (favorite/contact) still gate on auth.
  const openDetail = () => navigate(`/listing/${listing.id}`);

  const imageUrl = listing.image_url || listing.images?.[0] || PLACEHOLDER_IMAGE;

  return (
    <Card
      className="w-full cursor-pointer overflow-hidden border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500"
      role="link"
      tabIndex={0}
      aria-label={`View ${listing.dog_name || 'listing'}${listing.breed ? `, ${listing.breed}` : ''}`}
      onClick={openDetail}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(); } }}
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
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
          }}
        />
        
        {/* Price badge — top left */}
        <div className="absolute left-3 top-3 z-10" style={{ zIndex: 10 }}>
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
        
        {/* Favorite heart — top right */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full p-0 shadow-sm backdrop-blur-sm"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.92)', 
            WebkitTapHighlightColor: 'transparent' 
          }}
          onClick={(e) => { e.stopPropagation(); requireAuth(() => {}); }}
          aria-label="Save to favorites"
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
        
        <Button size="sm" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); openDetail(); }}>
          View details
        </Button>
      </CardContent>
    </Card>
  );
};

const ExploreGuest = () => {
  const clearExploreFiltersRef = useRef<(() => void) | null>(null);
  // Responsive view mode: list on mobile, grid on desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(window.innerWidth < 768 ? 'list' : 'grid');
  const [filters, setFilters] = useState<any>({});
  const [resultCount, setResultCount] = useState(0);

  // Listen for screen size changes and update view mode accordingly
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setViewMode(mobile ? 'list' : 'grid');
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debug logging - throttled to avoid excessive re-renders
  useEffect(() => {
    console.log('[EXPLORE GUEST] Component mounted');
  }, []);

  // REAL public marketplace inventory (never fabricated). Guests may read
  // dog_listings via the anon Supabase key (public RLS + the granted public
  // profile columns), exactly like the authenticated Explore.
  const { listings: allListings, loading: loadingListings } = useDogListings();

  // Apply the AdvancedFilters selection to the REAL data so guest search/filter
  // reflects actual inventory (impossible query → 0 results → honest empty state).
  // Note: age filtering is intentionally omitted here — listing.age is stored in
  // weeks while the filter's ageRange scale is ambiguous, and applying it would
  // wrongly exclude real listings.
  const listings = useMemo(() => {
    let out = Array.isArray(allListings) ? allListings : [];
    const kw = (filters.keywords || '').trim().toLowerCase();
    if (kw) {
      out = out.filter((l: any) =>
        (l.dog_name || '').toLowerCase().includes(kw) ||
        (l.breed || '').toLowerCase().includes(kw) ||
        (l.location || '').toLowerCase().includes(kw)
      );
    }
    if (Array.isArray(filters.breeds) && filters.breeds.length > 0) {
      const set = new Set(filters.breeds.map((b: string) => b.toLowerCase()));
      out = out.filter((l: any) => l.breed && set.has(String(l.breed).toLowerCase()));
    }
    if (filters.location && String(filters.location).trim()) {
      const loc = String(filters.location).trim().toLowerCase();
      out = out.filter((l: any) => (l.location || '').toLowerCase().includes(loc));
    }
    const pr = filters.priceRange;
    if (Array.isArray(pr) && (pr[0] > 0 || pr[1] < 5000)) {
      out = out.filter((l: any) => {
        const p = Number(l.price) || 0;
        return p >= pr[0] && p <= pr[1];
      });
    }
    return out;
  }, [allListings, filters]);

  // Update result count when the filtered listings change
  useEffect(() => {
    setResultCount(listings.length || 0);
  }, [listings]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const hasActiveFilters = Boolean(
    (filters.keywords && String(filters.keywords).trim()) ||
    (Array.isArray(filters.breeds) && filters.breeds.length) ||
    (filters.location && String(filters.location).trim()) ||
    (Array.isArray(filters.priceRange) && (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000))
  );

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
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <AdvancedFilters onFiltersChange={handleFiltersChange} clearFiltersRef={clearExploreFiltersRef} />
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
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                  <Dog className="h-12 w-12" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {hasActiveFilters ? 'No puppies match your search' : 'No listings available yet'}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  {hasActiveFilters
                    ? 'Try adjusting or resetting your filters to see more results.'
                    : 'New puppies are added regularly — please check back soon.'}
                </p>
                {hasActiveFilters && (
                  <Button
                    type="button"
                    className="mt-6 bg-blue-600 hover:bg-blue-700"
                    onClick={() => clearExploreFiltersRef.current?.()}
                  >
                    Reset all filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExploreGuest;