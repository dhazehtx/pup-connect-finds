
import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import ExploreLoading from '@/components/ExploreLoading';

const Explore = () => {
  const { searchListings, loading } = useAdvancedSearch();
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  
  const [listings, setListings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const popularBreeds = [
    'French Bulldog',
    'Golden Retriever', 
    'German Shepherd',
    'Labrador',
    'Beagle'
  ];

  const quickFilters = [
    'Under $1000',
    'Puppies Only',
    'Verified Only',
    'Nearby (10mi)'
  ];

  // Mock data for display
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
      verified: true
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
      verified: true
    },
    {
      id: 3,
      title: 'German Shepherd Puppies',
      price: '$2,200',
      location: 'San Jose, CA',
      breed: 'German Shepherd',
      age: '6 weeks',
      available: 4,
      image: 'https://images.unsplash.com/photo-1551717758-536850ae29035b6d?w=400&h=400&fit=crop',
      verified: true
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
      verified: false
    }
  ];

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    // Simulate loading delay
    setIsInitialLoading(true);
    setTimeout(() => {
      setListings(mockListings);
      setIsInitialLoading(false);
    }, 500);
  };

  const handleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    // Initial load with mock data
    const timer = setTimeout(() => {
      setListings(mockListings);
      setIsInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state during initial load
  if (isInitialLoading) {
    return <ExploreLoading />;
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by breed, breeder name, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
          <Button 
            variant="outline" 
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
        </div>

        {/* Popular Breeds */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Popular Breeds</h3>
          <div className="flex flex-wrap gap-2">
            {popularBreeds.map((breed) => (
              <Badge 
                key={breed}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50 hover:border-blue-200"
                onClick={() => handleSearch(breed)}
              >
                {breed}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <Badge 
                key={filter}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search for puppies, breeds, or locations..."
            className="pl-10 bg-gray-50 border-gray-200"
          />
          <Button 
            variant="outline" 
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{listings.length} puppies available</h2>
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
            <Select defaultValue="newest">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Listings Grid */}
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {listings.map((listing) => (
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
