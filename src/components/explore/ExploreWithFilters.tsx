import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDogListings } from '@/hooks/useDogListings';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CollapsibleFiltersPanel from './CollapsibleFiltersPanel';
import ListingCard from './ListingCard';
import ListingsSkeleton from './ListingsSkeleton';

const ExploreWithFilters = () => {
  const { listings, loading, searchListings } = useDogListings();
  const [searchParams] = useSearchParams();
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const [filters, setFilters] = useState({
    breed: '',
    gender: '',
    size: '',
    color: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    vaccinated: false,
    neutered_spayed: false,
    good_with_kids: false,
    good_with_dogs: false,
    delivery_available: false,
    rehoming: false,
  });

  // Comprehensive breed list - alphabetized and includes most popular breeds
  const popularBreeds = [
    'Afghan Hound',
    'Airedale Terrier',
    'Akita',
    'Alaskan Malamute',
    'American Bulldog',
    'American Pit Bull Terrier',
    'Australian Cattle Dog',
    'Australian Shepherd',
    'Basenji',
    'Basset Hound',
    'Beagle',
    'Bernese Mountain Dog',
    'Bichon Frise',
    'Border Collie',
    'Boston Terrier',
    'Boxer',
    'Brittany',
    'Bulldog',
    'Bullmastiff',
    'Cairn Terrier',
    'Cavalier King Charles Spaniel',
    'Chihuahua',
    'Chinese Crested',
    'Chow Chow',
    'Cocker Spaniel',
    'Collie',
    'Dachshund',
    'Dalmatian',
    'Doberman Pinscher',
    'English Setter',
    'French Bulldog',
    'German Shepherd',
    'German Shorthaired Pointer',
    'Golden Retriever',
    'Great Dane',
    'Great Pyrenees',
    'Greyhound',
    'Havanese',
    'Irish Setter',
    'Jack Russell Terrier',
    'Labrador Retriever',
    'Maltese',
    'Mastiff',
    'Mixed Breed',
    'Newfoundland',
    'Pomeranian',
    'Poodle',
    'Pug',
    'Rhodesian Ridgeback',
    'Rottweiler',
    'Saint Bernard',
    'Samoyed',
    'Schnauzer',
    'Shih Tzu',
    'Siberian Husky',
    'Staffordshire Terrier',
    'Vizsla',
    'Weimaraner',
    'West Highland White Terrier',
    'Yorkshire Terrier'
  ];

  // Sort listings based on sortBy value
  const sortedListings = React.useMemo(() => {
    if (!listings || listings.length === 0) return [];
    
    const sorted = [...listings];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'age-young':
        return sorted.sort((a, b) => (a.age || 0) - (b.age || 0));
      case 'distance':
        return sorted.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
      case 'rating':
        return sorted;
      default: // newest
        return sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
  }, [listings, sortBy]);

  useEffect(() => {
    const initialSearch = searchParams.get('search');
    if (initialSearch) {
      handleSearch(initialSearch);
    } else {
      handleSearch('');
    }
  }, [searchParams]);

  const handleSearch = async (query: string) => {
    try {
      const searchFilters = {
        ...filters,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      };
      await searchListings(query, searchFilters);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleFilterUpdate = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    const currentSearch = searchParams.get('search') || '';
    handleSearch(currentSearch);
  };

  const handleClearAllFilters = () => {
    const clearedFilters = {
      breed: '',
      gender: '',
      size: '',
      color: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      vaccinated: false,
      neutered_spayed: false,
      good_with_kids: false,
      good_with_dogs: false,
      delivery_available: false,
      rehoming: false,
    };
    setFilters(clearedFilters);
    const currentSearch = searchParams.get('search') || '';
    setTimeout(() => handleSearch(currentSearch), 0);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filters Toggle Bar - Simplified since search is now in unified header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">
              Explore Puppies
            </h1>
            <span className="text-sm text-gray-500">
              {loading ? 'Searching...' : `${sortedListings.length} puppies found`}
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className={`text-gray-700 border-gray-300 hover:bg-gray-50 transition-all duration-200 rounded-full ${
              showFiltersPanel 
                ? 'border-blue-500 text-blue-600 bg-blue-50 shadow-sm' 
                : 'hover:border-gray-400 shadow-sm'
            }`}
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFiltersPanel && (
              <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </Button>
        </div>
      </div>

      {/* Collapsible Filters Panel */}
      <CollapsibleFiltersPanel
        isOpen={showFiltersPanel}
        onClose={() => setShowFiltersPanel(false)}
        filters={filters}
        onFilterUpdate={handleFilterUpdate}
        onClearAllFilters={handleClearAllFilters}
        onApplyFilters={handleApplyFilters}
        popularBreeds={popularBreeds}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Listings Grid */}
        {loading ? (
          <ListingsSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {sortedListings.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🐶</div>
                <p className="text-gray-500 text-lg mb-2">No puppies found?</p>
                <p className="text-gray-400">Try adjusting your filters or check nearby areas.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExploreWithFilters;
