
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import ListingsGrid from '@/components/ListingsGrid';
import QuickFilters from '@/components/QuickFilters';
import SearchFilters from '@/components/SearchFilters';
import SortingOptions from '@/components/SortingOptions';
import SavedSearches from '@/components/SavedSearches';
import AdvancedSearchInterface from '@/components/search/AdvancedSearchInterface';
import SearchHistory from '@/components/search/SearchHistory';
import ListingAnalyticsDashboard from '@/components/analytics/ListingAnalyticsDashboard';
import BulkListingManager from '@/components/listings/BulkListingManager';
import ListingQualityChecker from '@/components/moderation/ListingQualityChecker';
import MobileListingCard from '@/components/listings/MobileListingCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDogListings } from '@/hooks/useDogListings';
import { useEnhancedListings } from '@/hooks/useEnhancedListings';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, SlidersHorizontal, BarChart3, Settings, Star, Heart, Eye, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExplorePageProps {}

const ExplorePage: React.FC<ExplorePageProps> = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isBulkManagerOpen, setIsBulkManagerOpen] = useState(false);
  const [isQualityCheckerOpen, setIsQualityCheckerOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const [isMobile, setIsMobile] = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    listings,
    loading,
    error,
    totalCount,
    page,
    pageSize,
    setPage,
    setPageSize,
    sortConfig,
    setSortConfig,
    filters,
    setFilters,
    searchHistory,
    addSearchToHistory,
    clearSearchHistory,
    savedSearches,
    saveSearch,
    deleteSearch,
    applySavedSearch,
    clearAllFilters,
    quickFilter,
    setQuickFilter,
    enhancedListings,
    favoriteListing,
    isListingFavorited,
    trackListingView,
    trackListingInquiry
  } = useEnhancedListings();

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, searchTerm: query }));
    addSearchToHistory(query);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortConfig: any) => {
    setSortConfig(newSortConfig);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const toggleFilterVisibility = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleAdvancedSearch = () => {
    setIsAdvancedSearchOpen(!isAdvancedSearchOpen);
  };

  const toggleAnalyticsDashboard = () => {
    setIsAnalyticsOpen(!isAnalyticsOpen);
  };

  const toggleBulkListingManager = () => {
    setIsBulkManagerOpen(!isBulkManagerOpen);
  };

  const toggleQualityChecker = () => {
    setIsQualityCheckerOpen(!isQualityCheckerOpen);
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

  useEffect(() => {
    // Track initial page view
    if (listings && listings.length > 0) {
      listings.forEach(listing => {
        trackListingView(listing.id);
      });
    }
  }, [listings]);

  return (
    <Layout title="Explore Dogs for Adoption">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              Explore {totalCount !== null ? `(${totalCount})` : ''}
            </h1>
            <Badge variant="secondary">
              <TrendingUp className="h-4 w-4 mr-1" />
              Trending
            </Badge>
          </div>

          {/* Search Bar */}
          <div className="flex items-center space-x-2 w-full md:w-auto mt-3 md:mt-0">
            <Input
              type="search"
              placeholder="Search breeds, keywords..."
              className="flex-grow"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch((e.target as HTMLInputElement).value);
                }
              }}
            />
            <Button onClick={() => handleSearch(document.querySelector('input[type="search"]')?.value || '')}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <QuickFilters
          quickFilter={quickFilter}
          setQuickFilter={setQuickFilter}
          onClearAll={clearAllFilters}
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

        {/* Filters and Sorting Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters (Desktop) */}
          {!isMobile && (
            <div className="md:col-span-1">
              <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                isFilterOpen={isFilterOpen}
                toggleFilterVisibility={toggleFilterVisibility}
              />
            </div>
          )}

          {/* Listings Grid */}
          <div className="md:col-span-3">
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
                listings={enhancedListings}
                loading={loading}
                error={error}
                totalCount={totalCount}
                page={page}
                pageSize={pageSize}
                setPage={handlePageChange}
                setPageSize={handlePageSizeChange}
                sortConfig={sortConfig}
                setSortConfig={handleSortChange}
                isListingFavorited={isListingFavorited}
                onFavorite={favoriteListing}
                onView={trackListingView}
                onContact={trackListingInquiry}
              />
            )}
          </div>
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
                filters={filters}
                onFilterChange={handleFilterChange}
                isMobile={true}
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
                sortConfig={sortConfig}
                onSortChange={handleSortChange}
                isMobile={true}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExplorePage;
