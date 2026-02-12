import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Grid, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdvancedFilters from '@/components/explore/AdvancedFilters';
import ListingCard from '@/components/marketplace/ListingCard';
import PostCard from '@/components/feed/PostCard';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const DEBUG_NAV = import.meta.env.DEV && false;

const ExploreAuth: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'posts'>('listings');
  // Responsive view mode: list on mobile, grid on desktop
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(typeof window !== 'undefined' && window.innerWidth < 768 ? 'list' : 'grid');
  // STABLE INITIAL FILTERS - Prevent infinite re-renders with stable default values
  const initialFilters = useMemo(() => ({
    breeds: [],
    ageRange: [0, 10],
    gender: 'all',
    location: '',
    priceRange: [0, 5000],
    sortBy: 'newest',
    verifiedOnly: false,
    healthTested: false,
    vaccinated: false,
    keywords: ''
  }), []);

  const [filters, setFilters] = useState<any>(initialFilters);
  const [resultCount, setResultCount] = useState(0);

  // 1. ONE-TIME FETCH GUARD - Prevent fetch loops with ref guards
  const hasFetchedListingsRef = useRef(false);
  const hasFetchedPostsRef = useRef(false);

  // 4. TIMEOUT DIAGNOSTICS - Track data fetch timeouts
  const [showTimeoutFallback, setShowTimeoutFallback] = useState(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log('[EXPLORE AUTH] Rendering component', {
    userId: user?.id,
    hasUser: !!user,
    loading,
    activeTab,
    viewMode,
    hasFetchedListings: hasFetchedListingsRef.current,
    hasFetchedPosts: hasFetchedPostsRef.current
  });

  // EARLY RETURN: Show loading spinner while auth is resolving
  if (loading) {
    console.log('[EXPLORE AUTH] Showing loading spinner - auth is still resolving');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading explore page...</p>
        </div>
      </div>
    );
  }

  console.log('[EXPLORE AUTH] Auth settled - rendering full component', { userId: user?.id });

  useEffect(() => {
    console.log('[EXPLORE AUTH] Component mounted');
    
    // Listen for screen size changes and update view mode accordingly
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setViewMode(mobile ? 'list' : 'grid');
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      console.log('[EXPLORE AUTH] Component unmounted');
      window.removeEventListener('resize', handleResize);
      // Reset fetch guards on unmount
      hasFetchedListingsRef.current = false;
      hasFetchedPostsRef.current = false;
    };
  }, []);

  // 2. DELAY FETCH UNTIL AUTH IS SETTLED - Wait for auth loading to complete
  const shouldFetchListings = !loading && !!user && activeTab === 'listings' && !hasFetchedListingsRef.current;
  const shouldFetchPosts = !loading && !!user && activeTab === 'posts' && !hasFetchedPostsRef.current;

  // STABLE QUERY KEYS - Serialize filters to prevent object reference changes
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  // Fetch listings with real API call
  const { data: listings, isLoading: loadingListings, refetch: refetchListings, error: listingsError } = useQuery({
    queryKey: ['explore-listings', filtersKey],
    queryFn: async () => {
      console.log('[EXPLORE AUTH] Starting real listings fetch...');
      hasFetchedListingsRef.current = true;
      
      // Clear any existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      // Set 5-second timeout for diagnostics
      fetchTimeoutRef.current = setTimeout(() => {
        console.warn('[EXPLORE AUTH] Listings data still missing after 5 second timeout');
        setShowTimeoutFallback(true);
      }, 5000);
      
      try {
        // Build query parameters from filters
        const params = new URLSearchParams();
        if (filters.breeds?.length > 0) {
          params.append('breeds', filters.breeds.join(','));
        }
        if (filters.location && filters.location !== 'all') {
          params.append('location', filters.location);
        }
        if (filters.gender && filters.gender !== 'all') {
          params.append('gender', filters.gender);
        }
        if (filters.priceRange) {
          params.append('min_price', filters.priceRange[0].toString());
          params.append('max_price', filters.priceRange[1].toString());
        }
        if (filters.ageRange) {
          params.append('min_age', filters.ageRange[0].toString());
          params.append('max_age', filters.ageRange[1].toString());
        }
        if (filters.verifiedOnly) {
          params.append('verified_only', 'true');
        }
        if (filters.healthTested) {
          params.append('health_tested', 'true');
        }
        if (filters.vaccinated) {
          params.append('vaccinated', 'true');
        }
        
        console.log('[EXPLORE AUTH] Fetching listings with params:', params.toString());
        
        const response = await apiRequest(`listings?${params.toString()}`);
        
        // Clear timeout on successful completion
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
          setShowTimeoutFallback(false);
        }
        
        console.log('[EXPLORE AUTH] Real listings data loaded:', response.length, 'listings');
        setResultCount(response.length);
        return response;
      } catch (error) {
        console.error('[EXPLORE AUTH] Error fetching listings:', error);
        // Clear timeout on error
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        throw error;
      }
    },
    enabled: shouldFetchListings,
  });

  // Fetch posts with real API call
  const { data: posts, isLoading: loadingPosts, refetch: refetchPosts, error: postsError } = useQuery({
    queryKey: ['explore-posts', filtersKey],
    queryFn: async () => {
      console.log('[EXPLORE AUTH] Starting real posts fetch...');
      hasFetchedPostsRef.current = true;
      
      // Clear any existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      // Set 5-second timeout for diagnostics
      fetchTimeoutRef.current = setTimeout(() => {
        console.warn('[EXPLORE AUTH] Posts data still missing after 5 second timeout');
        setShowTimeoutFallback(true);
      }, 5000);
      
      try {
        console.log('[EXPLORE AUTH] Fetching real posts...');
        
        const response = await apiRequest('posts');
        
        // Clear timeout on successful completion
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
          setShowTimeoutFallback(false);
        }
        
        console.log('[EXPLORE AUTH] Real posts data loaded:', response.length, 'posts');
        return response;
      } catch (error) {
        console.error('[EXPLORE AUTH] Error fetching posts:', error);
        // Clear timeout on error
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        throw error;
      }
    },
    enabled: shouldFetchPosts,
  });

  // Update result count based on actual data
  useEffect(() => {
    if (activeTab === 'listings' && listings && Array.isArray(listings)) {
      setResultCount(listings.length);
    } else if (activeTab === 'posts' && posts && Array.isArray(posts)) {
      setResultCount(posts.length);
    } else {
      setResultCount(0);
    }
  }, [activeTab, listings, posts]);

  // STABLE FILTER HANDLER - Prevent recreation on every render
  const handleFiltersChange = useCallback((newFilters: any) => {
    console.log('[EXPLORE AUTH] Filters changed:', newFilters);
    setFilters(newFilters);
    
    // Reset fetch guards to allow refetch with new filters
    if (activeTab === 'listings') {
      hasFetchedListingsRef.current = false;
      refetchListings();
    } else {
      hasFetchedPostsRef.current = false;
      refetchPosts();
    }
  }, [activeTab, refetchListings, refetchPosts]);

  // 3. LOG CLEARLY WHEN DATA ARRIVES OR ERRORS
  useEffect(() => {
    if (listings && Array.isArray(listings)) {
      console.log('[EXPLORE AUTH] Listings data loaded successfully:', listings.length, 'items');
    }
    if (listingsError) {
      console.error('[EXPLORE AUTH] Listings loading failed:', listingsError);
    }
  }, [listings, listingsError]);

  useEffect(() => {
    if (posts && Array.isArray(posts)) {
      console.log('[EXPLORE AUTH] Posts data loaded successfully:', posts.length, 'items');
    }
    if (postsError) {
      console.error('[EXPLORE AUTH] Posts loading failed:', postsError);
    }
  }, [posts, postsError]);

  // Handle tab changes with navigation diagnostics
  const handleTabChange = (newTab: 'listings' | 'posts') => {
    if (DEBUG_NAV) console.debug('[NAV CLICK] explore tab:', newTab);
    if (DEBUG_NAV) console.debug('[EXPLORE AUTH] Tab changed from', activeTab, 'to', newTab);
    setActiveTab(newTab);
    
    // Clear timeout fallback when switching tabs
    setShowTimeoutFallback(false);
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Reset fetch guard for the new tab if it hasn't been fetched yet
    if (newTab === 'listings' && !hasFetchedListingsRef.current) {
      console.log('[EXPLORE AUTH] Will fetch listings for first time');
    } else if (newTab === 'posts' && !hasFetchedPostsRef.current) {
      console.log('[EXPLORE AUTH] Will fetch posts for first time');
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const isLoading = loadingListings || loadingPosts;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Filters Sidebar */}
      <div className="w-full lg:w-1/4 bg-white border-r border-gray-200 p-6">
        <div className="sticky top-6">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <AdvancedFilters 
            onFiltersChange={handleFiltersChange}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore</h1>
            <p className="text-gray-600">
              {resultCount} {activeTab === 'listings' ? 'listings' : 'posts'} found
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as 'listings' | 'posts')} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="listings">Puppy Listings</TabsTrigger>
            <TabsTrigger value="posts">Community Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-6">
            {showTimeoutFallback && activeTab === 'listings' ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-blue-600 mb-2 text-2xl">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Listings Loading Delayed</h3>
                  <p className="text-gray-600 mb-4">Listings are taking longer than expected to load.</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={() => {
                        console.log('[RETRY CLICK] retrying listings fetch');
                        setShowTimeoutFallback(false);
                        hasFetchedListingsRef.current = false;
                        refetchListings();
                      }}
                      variant="outline"
                    >
                      Retry Loading
                    </Button>
                    <Button 
                      onClick={() => {
                        if (DEBUG_NAV) console.debug('[NAV CLICK] switching to posts from timeout fallback');
                        handleTabChange('posts');
                      }}
                      variant="ghost"
                    >
                      Switch to Posts
                    </Button>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {/* Mock data for demonstration */}
                {Array.from({ length: 6 }, (_, i) => (
                  <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img 
                        src={`https://images.unsplash.com/photo-${1552053831 + i * 1000}?w=400`}
                        alt={`${['Golden Retriever', 'Labrador', 'German Shepherd'][i % 3]} Puppy`}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{`Beautiful ${['Golden Retriever', 'Labrador', 'German Shepherd'][i % 3]} Puppy`}</h3>
                        <span className="text-lg font-bold text-blue-600">${[1200, 1000, 1500][i % 3]}</span>
                      </div>
                      <p className="text-gray-600 mb-2">{['Golden Retriever', 'Labrador', 'German Shepherd'][i % 3]} • {[2, 3, 4][i % 3]} months</p>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span>{['San Francisco, CA', 'Los Angeles, CA', 'New York, NY'][i % 3]}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            {showTimeoutFallback && activeTab === 'posts' ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-blue-600 mb-2 text-2xl">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Posts Loading Delayed</h3>
                  <p className="text-gray-600 mb-4">Posts are taking longer than expected to load.</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={() => {
                        console.log('[RETRY CLICK] retrying posts fetch');
                        setShowTimeoutFallback(false);
                        hasFetchedPostsRef.current = false;
                        refetchPosts();
                      }}
                      variant="outline"
                    >
                      Retry Loading
                    </Button>
                    <Button 
                      onClick={() => {
                        if (DEBUG_NAV) console.debug('[NAV CLICK] switching to listings from timeout fallback');
                        handleTabChange('listings');
                      }}
                      variant="ghost"
                    >
                      Switch to Listings
                    </Button>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                  : 'space-y-6'
              }>
                {/* Mock data for demonstration */}
                {Array.from({ length: 4 }, (_, i) => (
                  <PostCard
                    key={i}
                    post={{
                      id: `post-${i}`,
                      user_id: `user-${i}`,
                      content: `Amazing day at the dog park with my ${['Golden Retriever', 'Beagle', 'Poodle', 'Labrador'][i]}! 🐕`,
                      images: [`https://images.unsplash.com/photo-${1552053831 + i * 2000}?w=600`],
                      hashtags: ['DogPark', 'PuppyLife', 'DogLover'],
                      post_type: 'photo',
                      created_at: new Date().toISOString(),
                      likes_count: 15 + i * 5,
                      comments_count: 3 + i,
                      shares_count: 1 + i,
                      profiles: {
                        full_name: `Dog Owner ${i + 1}`,
                        username: `dogowner${i + 1}`,
                        avatar_url: `https://images.unsplash.com/photo-${1494790108 + i * 1000}?w=150`,
                        verified: i % 2 === 0
                      }
                    }}
                    onLike={() => {}}
                    onComment={() => {}}
                    onShare={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExploreAuth;