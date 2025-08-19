import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Heart, MapPin, Star, Grid, List } from 'lucide-react';
import AdvancedFilters from '@/components/explore/AdvancedFilters';
import FeaturedPosts from '@/components/FeaturedPosts';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { apiRequest } from '@/lib/api';



const PuppyGrid = ({ listings, viewMode }: { listings?: any[], viewMode: 'grid' | 'list' }) => {
  // Use provided listings or fallback to demo data
  const displayData = listings || [
    {
      id: 1,
      name: "Golden Retriever Puppy",
      breed: "Golden Retriever",
      age: "8 weeks",
      price: "$1,200",
      location: "San Francisco, CA",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
      breeder: "Golden Dreams Kennel"
    },
    {
      id: 2,
      name: "Labrador Puppy",
      breed: "Labrador Retriever",
      age: "10 weeks",
      price: "$1,000",
      location: "Los Angeles, CA",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400",
      breeder: "Happy Tails Breeding"
    }
  ];

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {displayData.map((puppy) => (
          <Card key={puppy.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <img 
                  src={puppy.image} 
                  alt={puppy.name}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{puppy.name}</h3>
                    <span className="text-lg font-bold text-blue-600">{puppy.price}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{puppy.breed} • {puppy.age}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {puppy.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-blue-400 mr-1" />
                      <span className="text-sm font-medium">{puppy.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">{puppy.breeder}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/80 hover:bg-white self-start"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayData.map((puppy) => (
        <Card key={puppy.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <div className="relative">
            <img 
              src={puppy.image} 
              alt={puppy.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{puppy.name}</h3>
              <span className="text-lg font-bold text-blue-600">{puppy.price}</span>
            </div>
            <p className="text-gray-600 mb-2">{puppy.breed} • {puppy.age}</p>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {puppy.location}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-blue-400 mr-1" />
                <span className="text-sm font-medium">{puppy.rating}</span>
              </div>
              <span className="text-sm text-gray-500">{puppy.breeder}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ExploreGuest = () => {
  const [activeTab, setActiveTab] = useState<'listings' | 'posts'>('listings');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<any>({});
  const [resultCount, setResultCount] = useState(0);

  // Debug logging - throttled to avoid excessive re-renders
  useEffect(() => {
    console.log('[EXPLORE GUEST] Component mounted');
  }, []);

  // Fetch listings - using demo data for guest users since API endpoints may not be available
  const { data: listings, isLoading: loadingListings } = useQuery({
    queryKey: ['explore-listings-guest', filters],
    queryFn: async () => {
      // Return demo data for guest users
      return [
        {
          id: 1,
          name: "Golden Retriever Puppy",
          breed: "Golden Retriever",
          age: "8 weeks",
          price: "$1,200",
          location: "San Francisco, CA",
          rating: 4.8,
          image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
          breeder: "Golden Dreams Kennel"
        },
        {
          id: 2,
          name: "Labrador Puppy", 
          breed: "Labrador Retriever",
          age: "10 weeks",
          price: "$1,000",
          location: "Los Angeles, CA",
          rating: 4.9,
          image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400",
          breeder: "Happy Tails Breeding"
        },
        {
          id: 3,
          name: "German Shepherd Puppy",
          breed: "German Shepherd", 
          age: "12 weeks",
          price: "$1,500",
          location: "Austin, TX",
          rating: 4.7,
          image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400",
          breeder: "Texas Shepherds"
        }
      ];
    },
    enabled: activeTab === 'listings',
  });

  // Fetch posts - using demo data for guest users
  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ['explore-posts-guest', filters],
    queryFn: async () => {
      // Return demo data for guest users
      return [
        {
          id: 1,
          title: "Tips for First-Time Dog Owners",
          content: "Bringing home your first puppy is exciting! Here are some essential tips to help you prepare...",
          author: { username: "PuppyExpert" },
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: "Best Dog Breeds for Families",
          content: "When choosing a family dog, consider these friendly and gentle breeds that are great with children...",
          author: { username: "FamilyDogLover" },
          created_at: new Date().toISOString()
        }
      ];
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

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'listings' | 'posts');
  };

  const isLoading = activeTab === 'listings' ? loadingListings : loadingPosts;
  const data = activeTab === 'listings' ? listings : posts;

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
                className="gap-2"
              >
                <Grid className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdvancedFilters onFiltersChange={handleFiltersChange} />
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="listings">Puppy Listings</TabsTrigger>
              <TabsTrigger value="posts">Community Posts</TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-gray-600">
              {resultCount} results found
            </div>
          </div>

          <TabsContent value="listings" className="space-y-6">
            {isLoading ? (
              <LoadingSpinner />
            ) : data && data.length > 0 ? (
              <PuppyGrid listings={data} viewMode={viewMode} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No listings found matching your criteria.</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            {isLoading ? (
              <LoadingSpinner />
            ) : data && data.length > 0 ? (
              <div className="space-y-4">
                {data.map((post: any) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.content}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>By {post.author?.username || 'Anonymous'}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No posts found matching your criteria.</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Featured Posts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-semibold mb-6">Featured Posts</h2>
        <FeaturedPosts />
      </div>
    </div>
  );
};

export default ExploreGuest;