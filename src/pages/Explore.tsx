
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import SearchFilters from '@/components/SearchFilters';
import SortingOptions from '@/components/SortingOptions';
import ListingsGrid from '@/components/ListingsGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import DogLoadingIcon from '@/components/DogLoadingIcon';
import { useToast } from '@/hooks/use-toast';
import { useListingFilters } from '@/hooks/useListingFilters';
import { sampleListings } from '@/data/sampleListings';

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

const Explore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
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

  const { sortedListings } = useListingFilters(sampleListings, filters, sortBy);

  // Auto-hide loading after 5 seconds to show the demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
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

  const handleFavorite = (id: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id];
      
      const listing = sampleListings.find(l => l.id === id);
      toast({
        title: prev.includes(id) ? "Removed from favorites" : "Added to favorites",
        description: listing ? `${listing.title}` : "Listing updated",
      });
      
      return newFavorites;
    });
  };

  const handleContact = (id: number) => {
    const listing = sampleListings.find(l => l.id === id);
    toast({
      title: "Contact initiated",
      description: `We'll connect you with ${listing?.breeder || 'the seller'}`,
    });
  };

  const handleViewDetails = (id: number) => {
    const listing = sampleListings.find(l => l.id === id);
    toast({
      title: "Opening details",
      description: `Viewing details for ${listing?.title || 'this listing'}`,
    });
  };

  if (isLoading) {
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
      {/* Header with Partnership Link */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/partnerships')}
            className="flex items-center gap-2"
          >
            <Users size={16} />
            Trusted Partners
          </Button>
        </div>
        <p className="text-gray-600">Find your perfect puppy companion from verified sellers and rescue partners</p>
      </div>

      {/* Search and Filter Component */}
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
        isLoading={isLoading}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
};

export default Explore;
