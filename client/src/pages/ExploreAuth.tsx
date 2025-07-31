import React, { useState, useEffect } from 'react';
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

const ExploreAuth: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'posts'>('listings');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<any>({});
  const [resultCount, setResultCount] = useState(0);

  // Fetch listings based on filters - disable by default to prevent rate limiting
  const { data: listings, isLoading: loadingListings, refetch: refetchListings } = useQuery({
    queryKey: ['explore-listings', filters],
    queryFn: async () => {
      // Return mock data to prevent API rate limiting
      return Array.from({ length: 6 }, (_, i) => ({
        id: `listing-${i}`,
        title: `Beautiful ${['Golden Retriever', 'Labrador', 'German Shepherd'][i % 3]} Puppy`,
        breed: ['Golden Retriever', 'Labrador', 'German Shepherd'][i % 3],
        price: [1200, 1000, 1500][i % 3],
        age_months: [2, 3, 4][i % 3],
        gender: ['male', 'female'][i % 2],
        location: ['San Francisco, CA', 'Los Angeles, CA', 'New York, NY'][i % 3],
        images: [`https://images.unsplash.com/photo-${1552053831 + i * 1000}?w=400`],
        health_tested: true,
        vaccinated: true
      }));
    },
    enabled: false, // Disable auto-fetch to prevent rate limiting
  });

  // Fetch posts based on filters - use mock data to prevent rate limiting
  const { data: posts, isLoading: loadingPosts, refetch: refetchPosts } = useQuery({
    queryKey: ['explore-posts', filters],
    queryFn: async () => {
      // Return mock data to prevent API rate limiting
      return Array.from({ length: 4 }, (_, i) => ({
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
      }));
    },
    enabled: false, // Disable auto-fetch to prevent rate limiting
  });

  // Update result count with mock data
  useEffect(() => {
    if (activeTab === 'listings') {
      setResultCount(6); // Mock listings count
    } else if (activeTab === 'posts') {
      setResultCount(4); // Mock posts count
    }
  }, [activeTab]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    
    // Refetch data based on active tab
    if (activeTab === 'listings') {
      refetchListings();
    } else {
      refetchPosts();
    }
  };

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
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'listings' | 'posts')} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="listings">Puppy Listings</TabsTrigger>
            <TabsTrigger value="posts">Community Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-6">
            {isLoading ? (
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
            {isLoading ? (
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