
import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, MapPin, MessageCircle, Sliders, Plus, Home, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sampleListings } from '@/data/sampleListings';
import { useDogListings } from '@/hooks/useDogListings';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
  const { listings, loading, fetchListings } = useDogListings();
  const { createConversation } = useMessaging();
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filteredListings, setFilteredListings] = useState(sampleListings);
  const [filters, setFilters] = useState({
    breed: 'All Breeds',
    source: 'All Sources', 
    ageGroup: 'All Ages',
    gender: 'All Genders',
    minPrice: '',
    maxPrice: '',
    maxDistance: 'Any distance',
    verifiedOnly: false,
    availableNow: false
  });
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Filter listings based on search term and filters
    let filtered = sampleListings;
    
    if (searchTerm) {
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.breeder.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.breed !== 'All Breeds') {
      filtered = filtered.filter(listing => listing.breed === filters.breed);
    }
    
    if (filters.verifiedOnly) {
      filtered = filtered.filter(listing => listing.verified);
    }
    
    setFilteredListings(filtered);
  }, [searchTerm, filters]);

  const popularBreeds = ['French Bulldog', 'Golden Retriever', 'German Shepherd', 'Labrador', 'Beagle'];
  const quickFilters = ['Under $1000', 'Puppies Only', 'Verified Only', 'Nearby (10mi)'];

  const handleContactSeller = async (listing: any) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact sellers",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Message sent!",
      description: `Contacting ${listing.breeder} about ${listing.title}`,
    });
  };

  const toggleFavorite = (listingId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
        toast({
          title: "Removed from favorites",
          description: "Dog removed from your favorites list",
        });
      } else {
        newFavorites.add(listingId);
        toast({
          title: "Added to favorites",
          description: "Dog added to your favorites list",
        });
      }
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with logo and search */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">MY PUP</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">🇺🇸 English</span>
            <span className="text-sm text-gray-600">danieluke97</span>
            <Button variant="outline" size="sm">auth.signOut</Button>
          </div>
        </div>
        
        {/* Main search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by breed, breeder name, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-20"
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
        </div>

        {/* Popular Breeds */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Breeds</h3>
          <div className="flex flex-wrap gap-2">
            {popularBreeds.map((breed) => (
              <Badge
                key={breed}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setFilters(prev => ({ ...prev, breed }))}
              >
                {breed}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  if (filter === 'Verified Only') {
                    setFilters(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }));
                  }
                }}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="space-y-4">
            {/* Filter dropdowns row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.breed}
                  onChange={(e) => setFilters(prev => ({ ...prev, breed: e.target.value }))}
                >
                  <option>All Breeds</option>
                  {popularBreeds.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.source}
                  onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                >
                  <option>All Sources</option>
                  <option>Breeders</option>
                  <option>Shelters</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.ageGroup}
                  onChange={(e) => setFilters(prev => ({ ...prev, ageGroup: e.target.value }))}
                >
                  <option>All Ages</option>
                  <option>Puppies (0-1 year)</option>
                  <option>Young (1-3 years)</option>
                  <option>Adult (3+ years)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.gender}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option>All Genders</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Verified only</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.availableNow}
                  onChange={(e) => setFilters(prev => ({ ...prev, availableNow: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Available now</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="px-4 py-3 bg-white border-b">
        <p className="text-sm text-gray-600">{filteredListings.length} puppies found</p>
      </div>

      {/* Listings Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
                
                {/* Price badge */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-black/70 text-white font-bold">
                    {listing.price}
                  </Badge>
                </div>
                
                {/* Verification badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {listing.verified && (
                    <Badge className="bg-blue-600 text-white text-xs">
                      Verified
                    </Badge>
                  )}
                  {listing.sourceType === 'shelter' && (
                    <Badge className="bg-green-600 text-white text-xs">
                      Shelter
                    </Badge>
                  )}
                </div>
                
                {/* Favorite button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-3 right-3 h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(listing.id);
                  }}
                >
                  <Heart 
                    className={`h-4 w-4 transition-colors ${
                      favorites.has(listing.id) ? "text-red-500 fill-current" : "text-gray-600"
                    }`} 
                  />
                </Button>
              </div>
              
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{listing.title}</h3>
                  <p className="text-muted-foreground">{listing.breed}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{listing.age}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{listing.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">⭐ {listing.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({listing.reviews} reviews)
                  </span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactSeller(listing);
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      toast({
                        title: "View Details",
                        description: `Viewing details for ${listing.title}`,
                      });
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 py-2">
          <button 
            className="flex flex-col items-center py-2 text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/')}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button className="flex flex-col items-center py-2 text-blue-600">
            <Search className="w-6 h-6" />
            <span className="text-xs mt-1">Explore</span>
          </button>
          
          <button 
            className="flex flex-col items-center py-2 text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/create-listing')}
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs mt-1">Post</span>
          </button>
          
          <button 
            className="flex flex-col items-center py-2 text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/messages')}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1">Messages</span>
          </button>
          
          <button 
            className="flex flex-col items-center py-2 text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/profile')}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Explore;
