import React, { useState, useEffect, useCallback } from 'react';
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

const EnhancedExplorePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'posts'>('listings');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<any>({});
  const [resultCount, setResultCount] = useState(0);

  // Fetch listings based on filters
  const { data: listings, isLoading: loadingListings, refetch: refetchListings } = useQuery({
    queryKey: ['explore-listings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add search keywords
      if (filters.keywords) {
        params.append('search', filters.keywords);
      }
      
      // Add breed filters
      if (filters.breeds?.length > 0) {
        filters.breeds.forEach((breed: string) => params.append('breed', breed));
      }
      
      // Add other filters
      if (filters.location) params.append('location', filters.location);
      if (filters.gender !== 'all') params.append('gender', filters.gender);
      if (filters.sortBy) params.append('sort', filters.sortBy);
      if (filters.verifiedOnly) params.append('verified', 'true');
      if (filters.healthTested) params.append('health_tested', 'true');
      if (filters.vaccinated) params.append('vaccinated', 'true');
      
      // Price range
      if (filters.priceRange?.[0] > 0) params.append('min_price', filters.priceRange[0].toString());
      if (filters.priceRange?.[1] < 5000) params.append('max_price', filters.priceRange[1].toString());
      
      // Age range
      if (filters.ageRange?.[0] > 0) params.append('min_age', filters.ageRange[0].toString());
      if (filters.ageRange?.[1] < 10) params.append('max_age', filters.ageRange[1].toString());

      const response = await apiRequest(`/api/dog-listings/search?${params.toString()}`);
      return response;
    },
    enabled: activeTab === 'listings',
  });

  // Fetch posts based on filters
  const { data: posts, isLoading: loadingPosts, refetch: refetchPosts } = useQuery({
    queryKey: ['explore-posts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.keywords) {
        params.append('search', filters.keywords);
      }
      
      if (filters.sortBy) {
        params.append('sort', filters.sortBy);
      }

      const response = await apiRequest(`/api/posts/search?${params.toString()}`);
      return response;
    },
    enabled: activeTab === 'posts',
  });

  // Update result count when data changes
  useEffect(() => {
    if (activeTab === 'listings' && listings) {
      setResultCount(listings.length || 0);
    } else if (activeTab === 'posts' && posts) {
      setResultCount(posts.length || 0);
    }
  }, [activeTab, listings, posts]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'listings' | 'posts');
  };

  const isLoading = activeTab === 'listings' ? loadingListings : loadingPosts;
  const data = activeTab === 'listings' ? listings : posts;

  const handleLike = async (postId: string) => {
    if (!user) return;
    // Like functionality will be handled by the PostCard component
  };

  const handleShare = async (postId: string) => {
    // Share functionality will be handled by the ShareModal component
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Explore</h1>
              <p className="text-gray-600 mt-1">
                Discover puppies, connect with breeders, and find your perfect companion
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Advanced Filters */}
        <div className="mb-8">
          <AdvancedFilters
            onFiltersChange={handleFiltersChange}
            className="shadow-sm"
          />
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="listings" className="px-6">
                Puppy Listings
              </TabsTrigger>
              <TabsTrigger value="posts" className="px-6">
                Community Posts
              </TabsTrigger>
            </TabsList>

            {/* Results Count */}
            <div className="flex items-center gap-4">
              {resultCount > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {resultCount} result{resultCount !== 1 ? 's' : ''} found
                </Badge>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Loading results...</span>
            </div>
          )}

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            {!isLoading && (!listings || listings.length === 0) ? (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <Search className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">No listings found</h3>
                    <p className="text-gray-600 mt-1">
                      Try adjusting your filters or search terms to find more results.
                    </p>
                  </div>
                  <Button
                    onClick={() => window.location.href = '/create-listing'}
                    className="mt-4"
                  >
                    List Your Puppy
                  </Button>
                </div>
              </Card>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {listings?.map((listing: any) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    variant={viewMode}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {!isLoading && (!posts || posts.length === 0) ? (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <Search className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">No posts found</h3>
                    <p className="text-gray-600 mt-1">
                      Try adjusting your search terms to find more posts.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {posts?.map((post: any) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Filter Summary */}
        {Object.keys(filters).length > 0 && (
          <Card className="mt-8 p-4 bg-blue-50 border-blue-200">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Active Filters
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.keywords && (
                  <Badge variant="outline" className="text-blue-800 border-blue-300">
                    Search: "{filters.keywords}"
                  </Badge>
                )}
                {filters.breeds?.map((breed: string) => (
                  <Badge key={breed} variant="outline" className="text-blue-800 border-blue-300">
                    Breed: {breed}
                  </Badge>
                ))}
                {filters.location && (
                  <Badge variant="outline" className="text-blue-800 border-blue-300">
                    Location: {filters.location}
                  </Badge>
                )}
                {filters.gender !== 'all' && (
                  <Badge variant="outline" className="text-blue-800 border-blue-300">
                    Gender: {filters.gender}
                  </Badge>
                )}
                {filters.verifiedOnly && (
                  <Badge variant="outline" className="text-blue-800 border-blue-300">
                    Verified Breeders Only
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedExplorePage;