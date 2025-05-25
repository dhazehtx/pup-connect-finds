
import React, { useState } from 'react';
import SearchFilters from '@/components/SearchFilters';
import SortingOptions from '@/components/SortingOptions';
import ListingsGrid from '@/components/ListingsGrid';
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
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600">Find your perfect puppy companion</p>
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
      />
    </div>
  );
};

export default Explore;
