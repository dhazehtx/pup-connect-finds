import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Filter, Grid, List, Mic, BarChart3, Settings } from 'lucide-react';
import SearchFilters from '@/components/SearchFilters';
import SortingOptions from '@/components/SortingOptions';
import ListingsGrid from '@/components/ListingsGrid';
import CreateListingForm from '@/components/listings/CreateListingForm';
import AdvancedSearchFilters from '@/components/search/AdvancedSearchFilters';
import SearchHistory from '@/components/search/SearchHistory';
import ListingAnalyticsDashboard from '@/components/analytics/ListingAnalyticsDashboard';
import BulkListingManager from '@/components/listings/BulkListingManager';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DogLoadingIcon from '@/components/DogLoadingIcon';
import { useToast } from '@/hooks/use-toast';
import { useListingFilters } from '@/hooks/useListingFilters';
import { useDogListings } from '@/hooks/useDogListings';
import { useListingAnalytics } from '@/hooks/useListingAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { sampleListings } from '@/data/sampleListings';
import VoiceSearchInterface from '@/components/search/VoiceSearchInterface';
import { useMobile } from '@/hooks/use-mobile';

interface FilterState {
  searchTerm: string;
  breed: string;
  minPrice: string;
  maxPrice: string;
  ageGroup: string;
  gender: string;
  sourceType: string;
  maxDistance: string;
  verifiedOnly: boolean;
  availableOnly: boolean;
}

interface Listing {
  id: number;
  title: string;
  price: string;
  location: string;
  distance: string;
  breed: string;
  color: string;
  gender: string;
  age: string;
  rating: number;
  reviews: number;
  image: string;
  breeder: string;
  verified: boolean;
  verifiedBreeder?: boolean;
  idVerified?: boolean;
  vetVerified?: boolean;
  available: number;
  sourceType: string;
  isKillShelter?: boolean;
}

const Explore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useMobile();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    breed: 'all',
    minPrice: '',
    maxPrice: '',
    ageGroup: 'all',
    gender: 'all',
    sourceType: 'all',
    maxDistance: 'all',
    verifiedOnly: false,
    availableOnly: false,
  });

  const { listings: dbListings, loading } = useDogListings();
  const { trackListingView } = useListingAnalytics();

  // Helper function to get breed-appropriate image
  const getBreedImage = (breed: string): string => {
    const breedImages: Record<string, string> = {
      'French Bulldog': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
      'English Bulldog': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop',
      'Golden Retriever': 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
      'German Shepherd': 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop',
      'Labrador': 'https://images.unsplash.com/photo-1518717743-49959800b1f6?w=400&h=300&fit=crop',
      'Poodle Mix': 'https://images.unsplash.com/photo-1616190260687-b7039d92c41b?w=400&h=300&fit=crop',
      'Siberian Husky': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop',
      'Boston Terrier': 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop',
      'Beagle': 'https://images.unsplash.com/photo-1544717342-7b6977ea1f8a?w=400&h=300&fit=crop',
      'Pembroke Welsh Corgi': 'https://images.unsplash.com/photo-1546975490-e8b92a360b24?w=400&h=300&fit=crop',
      'Rottweiler': 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=400&h=300&fit=crop'
    };
    
    return breedImages[breed] || 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop';
  };

  // Convert database listings to match the existing ListingCard interface
  const convertedDbListings: Listing[] = dbListings.map((listing, index) => ({
    id: index + 1000, // Offset to avoid conflicts
    title: `${listing.dog_name} - ${listing.breed}`,
    price: `$${listing.price.toLocaleString()}`,
    location: listing.profiles?.location || 'Location not specified',
    distance: '2.3 miles', // Placeholder
    breed: listing.breed,
    color: 'Various', // Placeholder
    gender: 'Mixed', // Placeholder
    age: `${listing.age} months`,
    rating: listing.profiles?.rating || 4.5,
    reviews: listing.profiles?.total_reviews || 0,
    image: listing.image_url || getBreedImage(listing.breed),
    breeder: listing.profiles?.full_name || listing.profiles?.username || 'Anonymous',
    verified: listing.profiles?.verified || false,
    verifiedBreeder: listing.profiles?.verified || false,
    idVerified: listing.profiles?.verified || false,
    vetVerified: listing.profiles?.verified || false,
    available: 1,
    sourceType: 'breeder',
    isKillShelter: false,
  }));

  // Combine sample listings with database listings for demo purposes
  const allListings = [...sampleListings, ...convertedDbListings];

  const { sortedListings } = useListingFilters(allListings, filters, sortBy);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'searchTerm') return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value !== '' && value !== 'all';
  });

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      breed: 'all',
      minPrice: '',
      maxPrice: '',
      ageGroup: 'all',
      gender: 'all',
      sourceType: 'all',
      maxDistance: 'all',
      verifiedOnly: false,
      availableOnly: false,
    });
  };

  const handleAdvancedSearch = (advancedFilters: any) => {
    // Convert advanced filters to basic filter format
    setFilters(prev => ({
      ...prev,
      searchTerm: advancedFilters.query || '',
      breed: advancedFilters.breeds.length > 0 ? advancedFilters.breeds[0] : 'all',
      minPrice: advancedFilters.priceRange[0].toString(),
      maxPrice: advancedFilters.priceRange[1].toString(),
      verifiedOnly: advancedFilters.verifiedSellersOnly,
    }));
    
    toast({
      title: "Search Updated",
      description: `Found ${sortedListings.length} listings matching your criteria`,
    });
  };

  const handleSaveSearch = (searchFilters: any, name: string) => {
    // Save search functionality
    toast({
      title: "Search Saved",
      description: `"${name}" has been saved. You'll be notified of new matches.`,
    });
  };

  const handleFavorite = (id: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id];
      
      const listing = sortedListings.find(l => l.id === id);
      toast({
        title: prev.includes(id) ? "Removed from favorites" : "Added to favorites",
        description: listing ? `${listing.title}` : "Listing updated",
      });
      
      return newFavorites;
    });
  };

  const handleContact = (id: number) => {
    const listing = sortedListings.find(l => l.id === id);
    toast({
      title: "Contact initiated",
      description: `We'll connect you with ${listing?.breeder || 'the seller'}`,
    });
  };

  const handleViewDetails = (id: number) => {
    const listing = sortedListings.find(l => l.id === id);
    toast({
      title: "Opening details",
      description: `Viewing details for ${listing?.title || 'this listing'}`,
    });
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    toast({
      title: "Success",
      description: "Your listing has been created successfully!",
    });
  };

  const handleVoiceSearchResults = (query: string, voiceFilters: any) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: query,
      ...voiceFilters
    }));
    setShowVoiceSearch(false);
    
    toast({
      title: "Voice search applied",
      description: `Found ${sortedListings.length} listings matching your voice search`,
    });
  };

  const handleBreedRecommendations = (breeds: string[]) => {
    if (breeds.length > 0) {
      setFilters(prev => ({
        ...prev,
        breed: breeds[0], // Use first recommended breed
        searchTerm: breeds.join(' OR ')
      }));
      
      toast({
        title: "AI recommendations applied",
        description: `Showing listings for recommended breeds`,
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Search Filters Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        {/* Sorting Options Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-32" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Listings Grid Skeleton with DogLoadingIcon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <DogLoadingIcon size={64} />
              </div>
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Enhanced Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-black">Marketplace</h1>
          <div className="flex gap-2 flex-wrap">
            {/* Voice Search Button */}
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowVoiceSearch(!showVoiceSearch)}
              className="flex items-center gap-2"
            >
              <Mic size={16} />
              {!isMobile && "Voice Search"}
            </Button>
            
            {isAuthenticated && (
              <>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                    >
                      <Plus size={16} />
                      {!isMobile && "Create Listing"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <CreateListingForm 
                      onSuccess={handleCreateSuccess}
                      onCancel={() => setIsCreateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 size={16} />
                  {!isMobile && "Analytics"}
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('management')}
                  className="flex items-center gap-2"
                >
                  <Settings size={16} />
                  {!isMobile && "Manage"}
                </Button>
              </>
            )}
            
            <Button 
              variant="default"
              size="sm"
              onClick={() => navigate('/partnerships')}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Users size={16} />
              {!isMobile && "Partners"}
            </Button>
          </div>
        </div>
        <p className="text-black">Find your perfect puppy companion with AI-powered search and recommendations</p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="search">Advanced Search</TabsTrigger>
          <TabsTrigger value="history">Search History</TabsTrigger>
          {isAuthenticated && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          {isAuthenticated && <TabsTrigger value="management">Management</TabsTrigger>}
          <TabsTrigger value="ai">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Voice Search Interface */}
          {showVoiceSearch && (
            <VoiceSearchInterface
              onSearchResults={handleVoiceSearchResults}
              onBreedRecommendation={handleBreedRecommendations}
            />
          )}

          {/* Search Filters */}
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            resultsCount={sortedListings.length}
            onClearFilters={handleClearFilters}
          />

          {/* Sorting and View Options */}
          <SortingOptions
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            resultsCount={sortedListings.length}
          />

          {/* Results */}
          <ListingsGrid
            listings={sortedListings}
            viewMode={viewMode}
            favorites={favorites}
            onFavorite={handleFavorite}
            onContact={handleContact}
            onViewDetails={handleViewDetails}
            isLoading={loading}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
            showEnhancedActions={true}
          />
        </TabsContent>

        <TabsContent value="search">
          <AdvancedSearchFilters
            onSearch={handleAdvancedSearch}
            onSaveSearch={handleSaveSearch}
          />
        </TabsContent>

        <TabsContent value="history">
          <SearchHistory />
        </TabsContent>

        {isAuthenticated && (
          <TabsContent value="analytics">
            <ListingAnalyticsDashboard />
          </TabsContent>
        )}

        {isAuthenticated && (
          <TabsContent value="management">
            <BulkListingManager />
          </TabsContent>
        )}

        <TabsContent value="ai">
          <VoiceSearchInterface
            onSearchResults={handleVoiceSearchResults}
            onBreedRecommendation={handleBreedRecommendations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Explore;
