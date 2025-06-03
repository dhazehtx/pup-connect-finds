
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
      description: 'Adorable French Bulldog puppies with excellent temperament and health tested parents.'
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
      description: 'Champion bloodline Golden Retriever puppies, perfect family companions.'
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
      description: 'Intelligent and loyal German Shepherd puppies from working lines.'
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
      description: 'Sweet Labrador mix puppies looking for loving homes.'
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
      description: 'Friendly Beagle puppies with excellent hunting lineage.'
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
      description: 'Sweet rescue dog looking for a second chance at happiness.'
    }
  ];

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setIsInitialLoading(true);
    
    // Filter mock listings based on search term
    if (term.trim()) {
      const filtered = mockListings.filter(listing => 
        listing.breed.toLowerCase().includes(term.toLowerCase()) ||
        listing.title.toLowerCase().includes(term.toLowerCase()) ||
        listing.location.toLowerCase().includes(term.toLowerCase())
      );
      setListings(filtered);
    } else {
      setListings(mockListings);
    }
    
    setTimeout(() => {
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
            onClick={() => handleSearch(searchTerm)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Search
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
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{listing.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
