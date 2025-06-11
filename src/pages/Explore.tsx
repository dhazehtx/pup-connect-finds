
import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, MapPin, MessageCircle, Sliders, Plus, Home, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchListings();
  }, []);

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

    if (user.id === listing.user_id) {
      toast({
        title: "Cannot contact yourself",
        description: "You cannot start a conversation with yourself",
        variant: "destructive",
      });
      return;
    }

    try {
      const conversationId = await createConversation(listing.id, listing.user_id);
      if (conversationId) {
        toast({
          title: "Conversation started",
          description: "You can now message the seller in your Messages",
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const toggleFavorite = (listingId: string) => {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
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

            {/* Price and distance row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <Input
                  placeholder="$0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <Input
                  placeholder="$10,000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Distance</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: e.target.value }))}
                >
                  <option>Any distance</option>
                  <option>Within 10 miles</option>
                  <option>Within 25 miles</option>
                  <option>Within 50 miles</option>
                  <option>Within 100 miles</option>
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
        <p className="text-sm text-gray-600">0 puppies found</p>
      </div>

      {/* Results area */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading listings...</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No dogs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
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
