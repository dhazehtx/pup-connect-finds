
import React, { useState, useEffect } from 'react';
import ExploreContainer from './ExploreContainer';
import { useDogListings } from '@/hooks/useDogListings';

const ExploreWithFilters = () => {
  const { listings, loading, searchListings } = useDogListings();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    breed: '',
    verifiedOnly: false,
    sortBy: 'newest',
    priceMin: '',
    priceMax: '',
    ageMin: '',
    ageMax: '',
    location: '',
    distance: 25,
    size: '',
    gender: '',
    color: '',
    coatLength: '',
    energyLevel: '',
    trainingLevel: '',
    paperwork: {
      healthCertificate: false,
      vaccinations: false,
      parentalScreening: false,
      registrationPapers: false,
    }
  });

  useEffect(() => {
    handleSearch();
  }, [filters, searchQuery]);

  const handleSearch = async () => {
    const searchFilters = {
      breed: filters.breed,
      minPrice: filters.priceMin ? parseFloat(filters.priceMin) : undefined,
      maxPrice: filters.priceMax ? parseFloat(filters.priceMax) : undefined,
      location: filters.location,
    };

    try {
      await searchListings(searchQuery, searchFilters);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Sort listings based on selected sort option
  const sortedListings = [...listings].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'alphabetical':
        return (a.dog_name || '').localeCompare(b.dog_name || '');
      default:
        return 0;
    }
  });

  return (
    <ExploreContainer
      listings={sortedListings}
      loading={loading}
      filters={filters}
      searchQuery={searchQuery}
      onFilterChange={handleFilterChange}
      onSearchChange={handleSearchChange}
      onSearch={handleSearch}
    />
  );
};

export default ExploreWithFilters;
