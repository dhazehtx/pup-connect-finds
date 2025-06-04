
import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Heart, BarChart3, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import ExploreLoading from '@/components/ExploreLoading';
import QuickFilters from '@/components/QuickFilters';
import { useNavigate } from 'react-router-dom';

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
  const { searchListings, loading } = useAdvancedSearch();
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  
  const [allListings, setAllListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
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

  // Enhanced mock data for better display
  const mockListings = [
    {
      id: 1,
      title: 'Beautiful French Bulldog Puppies',
      price: '$2,500',
      location: 'San Francisco, CA',
      breed: 'French Bulldog',
      age: '8 weeks',
      available: 3,
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop',
      verified: true,
      description: 'Adorable French Bulldog puppies with excellent temperament and health tested parents.',
      priceNum: 2500
    },
    {
      id: 2,
      title: 'Loyal Golden Retriever Pups',
      price: '$1,800',
      location: 'Oakland, CA',
      breed: 'Golden Retriever',
      age: '10 weeks',
      available: 2,
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
      verified: true,
      description: 'Champion bloodline Golden Retriever puppies, perfect family companions.',
      priceNum: 1800
    },
    {
      id: 3,
      title: 'German Shepherd Puppies',
      price: '$2,200',
      location: 'San Jose, CA',
      breed: 'German Shepherd',
      age: '6 weeks',
      available: 4,
      image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=400&fit=crop',
      verified: true,
      description: 'Intelligent and loyal German Shepherd puppies from working lines.',
      priceNum: 2200
    },
    {
      id: 4,
      title: 'Labrador Mix Puppies',
      price: '$1,200',
      location: 'Berkeley, CA',
      breed: 'Labrador',
      age: '12 weeks',
      available: 1,
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
      verified: false,
      description: 'Sweet Labrador mix puppies looking for loving homes.',
      priceNum: 1200
    },
    {
      id: 5,
      title: 'Beagle Puppies Available',
      price: '$900',
      location: 'Fremont, CA',
      breed: 'Beagle',
      age: '9 weeks',
      available: 2,
      image: 'https://images.unsplash.com/photo-1544717342-7b6977ea1f8a?w=400&h=400&fit=crop',
      verified: true,
      description: 'Friendly Beagle puppies with excellent hunting lineage.',
      priceNum: 900
    },
    {
      id: 6,
      title: 'Rescue Mixed Breed',
      price: '$200',
      location: 'Palo Alto, CA',
      breed: 'Mixed Breed',
      age: '1 year',
      available: 1,
      image: 'https://images.unsplash.com/photo-1529472119196-cb724127a98e?w=400&h=400&fit=crop',
      verified: false,
      description: 'Sweet rescue dog looking for a second chance at happiness.',
      priceNum: 200
    }
  ];

  // Apply all filters to listings
  const applyFilters = (listings: any[], currentFilters: FilterState) => {
    let filtered = [...listings];

    // Search term filter
    if (currentFilters.searchTerm.trim()) {
      filtered = filtered.filter(listing => 
        listing.breed.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
        listing.title.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(currentFilters.searchTerm.toLowerCase())
      );
    }

    // Breed filter
    if (currentFilters.breed !== 'all') {
      filtered = filtered.filter(listing =>
        listing.breed.toLowerCase().includes(currentFilters.breed.toLowerCase())
      );
    }

    // Price filters
    if (currentFilters.minPrice) {
      const minPrice = parseInt(currentFilters.minPrice.replace(/[$,]/g, ''));
      filtered = filtered.filter(listing => listing.priceNum >= minPrice);
    }

    if (currentFilters.maxPrice) {
      const maxPrice = parseInt(currentFilters.maxPrice.replace(/[$,]/g, ''));
      filtered = filtered.filter(listing => listing.priceNum <= maxPrice);
    }

    // Age group filter
    if (currentFilters.ageGroup !== 'all') {
      if (currentFilters.ageGroup === 'puppy') {
        filtered = filtered.filter(listing => 
          listing.age.includes('weeks') || 
          (listing.age.includes('month') && parseInt(listing.age) < 6)
        );
      }
    }

    // Verified filter
    if (currentFilters.verifiedOnly) {
      filtered = filtered.filter(listing => listing.verified);
    }

    // Available filter
    if (currentFilters.availableOnly) {
      filtered = filtered.filter(listing => listing.available > 0);
    }

    return filtered;
  };

  // Sort function
  const sortListings = (listings: any[], sortType: string) => {
    const sorted = [...listings];
    
    switch (sortType) {
      case 'price-low':
        return sorted.sort((a, b) => a.priceNum - b.priceNum);
      case 'price-high':
        return sorted.sort((a, b) => b.priceNum - a.priceNum);
      case 'newest':
      default:
        return sorted.sort((a, b) => b.id - a.id);
    }
  };

  // Handle search input change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    const newFilters = { ...filters, searchTerm: term };
    setFilters(newFilters);
    const filtered = applyFilters(allListings, newFilters);
    const sorted = sortListings(filtered, sortBy);
    setFilteredListings(sorted);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setSearchTerm(newFilters.searchTerm);
    const filtered = applyFilters(allListings, newFilters);
    const sorted = sortListings(filtered, sortBy);
    setFilteredListings(sorted);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
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
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    setFilteredListings(allListings);
  };

  // Handle sorting
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    const sorted = sortListings(filteredListings, newSortBy);
    setFilteredListings(sorted);
  };

  const handleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  // Initialize data
  useEffect(() => {
    setAllListings(mockListings);
    setFilteredListings(mockListings);
    setIsInitialLoading(false);
  }, []);

  // Show loading state during initial load
  if (isInitialLoading && filteredListings.length === 0) {
    return <ExploreLoading />;
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4 space-y-6">
        {/* Header with Progress Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Explore</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/completion-dashboard')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Progress
          </Button>
        </div>

        {/* Search Bar with Filter Button */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by breed, breeder name, or keywords..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <QuickFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{filteredListings.length} puppies available</h2>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Listings Grid */}
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={() => handleFavorite(listing.id)}
                >
                  <Heart 
                    className={`w-4 h-4 ${favorites.includes(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                  />
                </Button>
                {listing.available > 1 && (
                  <Badge className="absolute bottom-2 left-2 bg-blue-600">
                    {listing.available} available
                  </Badge>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                  {listing.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2">{listing.breed}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{listing.price}</span>
                  {listing.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{listing.location}</p>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{listing.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results Message */}
        {filteredListings.length === 0 && !isInitialLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No puppies found matching your criteria</p>
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
