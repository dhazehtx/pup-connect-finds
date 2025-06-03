import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import ListingsGrid from '@/components/ListingsGrid';
import QuickFilters from '@/components/QuickFilters';
import SearchFilters from '@/components/SearchFilters';
import SortingOptions from '@/components/SortingOptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEnhancedListings } from '@/hooks/useEnhancedListings';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, SlidersHorizontal, TrendingUp, X } from 'lucide-react';
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

interface ExplorePageProps {}

const ExplorePage: React.FC<ExplorePageProps> = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: '',
    breed: '',
    minPrice: '',
    maxPrice: '',
    ageGroup: '',
    gender: '',
    sourceType: '',
    maxDistance: '',
    verifiedOnly: false,
    availableOnly: false
  });
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();

  // Use sample listings for now
  const [listings, setListings] = useState(sampleListings);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    setFilterState(prev => ({ ...prev, searchTerm: query }));
    // Filter listings based on search term
    if (query.trim()) {
      const filtered = sampleListings.filter(listing => 
        listing.title.toLowerCase().includes(query.toLowerCase()) ||
        listing.breed.toLowerCase().includes(query.toLowerCase()) ||
        listing.breeder.toLowerCase().includes(query.toLowerCase())
      );
      setListings(filtered);
    } else {
      setListings(sampleListings);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilterState(newFilters);
    // Apply filters to listings
    let filtered = [...sampleListings];
    
    if (newFilters.breed) {
      filtered = filtered.filter(listing => 
        listing.breed.toLowerCase().includes(newFilters.breed.toLowerCase())
      );
    }
    
    if (newFilters.minPrice) {
      const minPrice = parseFloat(newFilters.minPrice.replace(/[^0-9.]/g, ''));
      filtered = filtered.filter(listing => {
        const price = parseFloat(listing.price.replace(/[^0-9.]/g, ''));
        return price >= minPrice;
      });
    }
    
    if (newFilters.maxPrice) {
      const maxPrice = parseFloat(newFilters.maxPrice.replace(/[^0-9.]/g, ''));
      filtered = filtered.filter(listing => {
        const price = parseFloat(listing.price.replace(/[^0-9.]/g, ''));
        return price <= maxPrice;
      });
    }
    
    if (newFilters.sourceType) {
      filtered = filtered.filter(listing => 
        listing.sourceType === newFilters.sourceType
      );
    }
    
    if (newFilters.verifiedOnly) {
      filtered = filtered.filter(listing => listing.verified);
    }
    
    setListings(filtered);
  };

  const openMobileFilters = () => {
    setIsMobileFiltersOpen(true);
  };

  const closeMobileFilters = () => {
    setIsMobileFiltersOpen(false);
  };

  const openMobileSort = () => {
    setIsMobileSortOpen(true);
  };

  const closeMobileSort = () => {
    setIsMobileSortOpen(false);
  };

  const handleClearFilters = () => {
    setFilterState({
      searchTerm: '',
      breed: '',
      minPrice: '',
      maxPrice: '',
      ageGroup: '',
      gender: '',
      sourceType: '',
      maxDistance: '',
      verifiedOnly: false,
      availableOnly: false
    });
    setListings(sampleListings);
  };

  const handleFavorite = (id: number) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }
    
    setFavoriteIds(prev => 
      prev.includes(id) 
        ? prev.filter(fId => fId !== id)
        : [...prev, id]
    );
    
    toast({
      title: favoriteIds.includes(id) ? "Removed from favorites" : "Added to favorites",
      description: "Your favorites have been updated",
    });
  };

  const handleContact = (id: number) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact breeders",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Message sent",
      description: "Your message has been sent to the breeder",
    });
  };

  const handleViewDetails = (id: number) => {
    // Navigate to listing details page
    console.log('Viewing details for listing:', id);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Quick Filters */}
        <QuickFilters
          filters={filterState}
          onFiltersChange={setFilterState}
          onClearFilters={handleClearFilters}
        />

        {/* Mobile Filters and Sorting */}
        {isMobile && (
          <div className="flex justify-between mb-4">
            <Button onClick={openMobileFilters} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button onClick={openMobileSort} variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </div>
        )}

        {/* Sorting Options */}
        <SortingOptions
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultsCount={listings.length}
        />

        {/* Listings Grid - Full Width */}
        <div className="w-full">
          {loading && <p>Loading listings...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {listings && listings.length === 0 && !loading && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-lg text-gray-600">No listings found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
          {listings && listings.length > 0 && (
            <ListingsGrid
              listings={listings}
              viewMode={viewMode}
              favorites={favoriteIds}
              onFavorite={handleFavorite}
              onContact={handleContact}
              onViewDetails={handleViewDetails}
              isLoading={loading}
              onClearFilters={handleClearFilters}
              hasActiveFilters={Object.values(filterState).some(value => 
                typeof value === 'boolean' ? value : value !== ''
              )}
            />
          )}
        </div>

        {/* Mobile Filter Modal */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 bg-white z-50">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button onClick={closeMobileFilters} variant="ghost">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <SearchFilters
                filters={filterState}
                onFiltersChange={handleFilterChange}
                resultsCount={listings.length}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>
        )}

        {/* Mobile Sorting Modal */}
        {isMobileSortOpen && (
          <div className="fixed inset-0 bg-white z-50">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Sort By</h2>
              <Button onClick={closeMobileSort} variant="ghost">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <SortingOptions
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                resultsCount={listings.length}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExplorePage;
