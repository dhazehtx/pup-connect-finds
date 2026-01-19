import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
import ListingCard from '@/components/ListingCard';



// Demo listing card that matches real ListingCard but with guest-mode behavior
const GuestListingCard = ({ listing }: { listing: any }) => {
  const navigate = useNavigate();
  
  const handleSignIn = () => {
    navigate('/auth/sign-up');
  };

  return (
    <Card 
      className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleSignIn}
    >
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={listing.image_url}
            alt={listing.dog_name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
          
          <div className="absolute top-3 right-3">
            <Badge className="bg-black/70 text-white font-bold">
              ${listing.price?.toLocaleString()}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-3 right-3 h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); handleSignIn(); }}
          >
            <Heart className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg leading-tight">{listing.dog_name}</h3>
            <p className="text-muted-foreground">{listing.breed}</p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{listing.age} weeks</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{listing.location}</span>
            </div>
          </div>
          
          <Button size="sm" className="w-full" onClick={handleSignIn}>
            Sign in to view
          </Button>
        </CardContent>
      </div>
    </Card>
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

  // Static demo data for guest users - matches real listing data shape
  // CRITICAL: Must include image_url, dog_name, price (number), age (number)
  const GUEST_DEMO_LISTINGS = [
    {
      id: "demo-1",
      dog_name: "Golden Retriever Puppy",
      breed: "Golden Retriever",
      age: 8,
      price: 1200,
      location: "Austin, TX",
      image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
      isDemo: true
    },
    {
      id: "demo-2",
      dog_name: "Labrador Puppy", 
      breed: "Labrador Retriever",
      age: 10,
      price: 1000,
      location: "Los Angeles, CA",
      image_url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop",
      isDemo: true
    },
    {
      id: "demo-3",
      dog_name: "German Shepherd Puppy",
      breed: "German Shepherd", 
      age: 12,
      price: 1500,
      location: "Chicago, IL",
      image_url: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop",
      isDemo: true
    },
    {
      id: "demo-4",
      dog_name: "French Bulldog Puppy",
      breed: "French Bulldog",
      age: 9,
      price: 2500,
      location: "New York, NY",
      image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop",
      isDemo: true
    },
    {
      id: "demo-5",
      dog_name: "Beagle Puppy",
      breed: "Beagle",
      age: 11,
      price: 800,
      location: "Seattle, WA",
      image_url: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&h=300&fit=crop",
      isDemo: true
    },
    {
      id: "demo-6",
      dog_name: "Poodle Puppy",
      breed: "Standard Poodle",
      age: 10,
      price: 1800,
      location: "Miami, FL",
      image_url: "https://images.unsplash.com/photo-1616149250666-c3d46d310e1f?w=400&h=300&fit=crop",
      isDemo: true
    }
  ];

  // Use static data - no network request needed for guests
  const listings = GUEST_DEMO_LISTINGS;
  const loadingListings = false;

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

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'listings' | 'posts');
  };

  const isLoading = activeTab === 'listings' ? loadingListings : loadingPosts;
  const data = activeTab === 'listings' ? listings : posts;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-1.5 min-h-[40px]"
              >
                <Grid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-1.5 min-h-[40px]"
              >
                <List className="h-4 w-4" />
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

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <TabsList className="grid w-full sm:w-auto sm:max-w-md grid-cols-2">
              <TabsTrigger value="listings" className="text-xs sm:text-sm">Puppy Listings</TabsTrigger>
              <TabsTrigger value="posts" className="text-xs sm:text-sm">Community Posts</TabsTrigger>
            </TabsList>
            
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
              {resultCount} results found
            </div>
          </div>

          <TabsContent value="listings" className="space-y-6">
            {loadingListings ? (
              <LoadingSpinner />
            ) : listings && listings.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
          </TabsContent>

          <TabsContent value="posts" className="space-y-4 sm:space-y-6">
            {loadingPosts ? (
              <LoadingSpinner />
            ) : posts && posts.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {posts.map((post: any) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{post.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">{post.content}</p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
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