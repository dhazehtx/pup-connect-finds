
import React, { useState, useEffect } from 'react';
import { MapPin, Filter, Search, Navigation, Layers, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import InteractiveMap from './InteractiveMap';

interface MapListing {
  id: string;
  title: string;
  price: string;
  breed: string;
  location: string;
  lat: number;
  lng: number;
  distance?: number;
  image: string;
  verified: boolean;
}

const EnhancedMapView = () => {
  const {
    currentLocation,
    locationPreferences,
    detectCurrentLocation,
    searchLocation,
    getDistanceToLocation,
    formatDistance
  } = useLocationServices();
  
  const { searchResults, performSearch } = useAdvancedSearch();
  
  const [listings, setListings] = useState<MapListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapRadius, setMapRadius] = useState([locationPreferences.maxDistance]);
  const [selectedBreed, setSelectedBreed] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MapListing | null>(null);
  const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');

  // Convert search results to map listings with location data
  const convertToMapListings = (results: any[]): MapListing[] => {
    return results.map((result, index) => {
      // Generate mock coordinates for demo - in production, use actual listing coordinates
      const baseLat = currentLocation?.lat || 37.7749;
      const baseLng = currentLocation?.lng || -122.4194;
      const lat = baseLat + (Math.random() - 0.5) * 0.1;
      const lng = baseLng + (Math.random() - 0.5) * 0.1;
      
      const distance = currentLocation ? getDistanceToLocation({
        lat,
        lng,
        address: result.location || 'Unknown'
      }) : undefined;

      return {
        id: result.id,
        title: result.dog_name || `Dog ${index + 1}`,
        price: `$${result.price?.toLocaleString() || '0'}`,
        breed: result.breed || 'Mixed',
        location: result.location || 'Location unknown',
        lat,
        lng,
        distance,
        image: result.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
        verified: Boolean(result.profiles?.verified)
      };
    }).filter(listing => 
      !listing.distance || listing.distance <= mapRadius[0]
    );
  };

  const loadNearbyListings = async () => {
    const filters = {
      breed: selectedBreed,
      location: searchQuery,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    };
    
    const results = await performSearch(filters);
    const mapListings = convertToMapListings(results);
    setListings(mapListings);
  };

  useEffect(() => {
    if (currentLocation) {
      loadNearbyListings();
    }
  }, [currentLocation, mapRadius, selectedBreed, priceRange]);

  const handleLocationSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchLocation(searchQuery);
      if (results.length > 0) {
        // Use first search result as new search center
        await loadNearbyListings();
      }
    }
  };

  const handleMarkerClick = (marker: any) => {
    const listing = listings.find(l => l.id === marker.id);
    setSelectedListing(listing || null);
  };

  const mapMarkers = listings.map(listing => ({
    id: listing.id,
    lat: listing.lat,
    lng: listing.lng,
    title: listing.title,
    description: `${listing.breed} • ${listing.price}`,
    type: 'listing' as const
  }));

  const getRecommendedListings = () => {
    return listings
      .filter(listing => listing.distance && listing.distance <= 10)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 3);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Interactive Map</h1>
        <p className="text-gray-600">Find puppies near you with our location-based search</p>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search location or breed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                className="pl-10"
              />
            </div>
            
            <Button onClick={handleLocationSearch} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            
            <Button 
              onClick={detectCurrentLocation}
              variant="outline"
            >
              <Navigation className="w-4 h-4 mr-2" />
              My Location
            </Button>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Search Radius: {mapRadius[0]}km</label>
                <Slider
                  value={mapRadius}
                  onValueChange={setMapRadius}
                  max={100}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Breed</label>
                <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any breed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any breed</SelectItem>
                    <SelectItem value="golden retriever">Golden Retriever</SelectItem>
                    <SelectItem value="labrador">Labrador</SelectItem>
                    <SelectItem value="german shepherd">German Shepherd</SelectItem>
                    <SelectItem value="french bulldog">French Bulldog</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Current Location Display */}
          {currentLocation && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-2 text-blue-800">
                <Target className="w-4 h-4" />
                <span className="font-medium">Searching near: {currentLocation.address}</span>
                <Badge variant="secondary">{listings.length} listings found</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <InteractiveMap
            markers={mapMarkers}
            center={currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lng } : undefined}
            onMarkerClick={handleMarkerClick}
            showUserLocation={true}
          />
        </div>

        {/* Listings and Recommendations */}
        <div className="space-y-4">
          {/* Recommended Listings */}
          {getRecommendedListings().length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Recommended Near You
                </h3>
                <div className="space-y-3">
                  {getRecommendedListings().map((listing) => (
                    <div key={listing.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex gap-3">
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{listing.title}</h4>
                          <p className="text-xs text-gray-600">{listing.breed}</p>
                          <p className="text-sm font-semibold">{listing.price}</p>
                          {listing.distance && (
                            <p className="text-xs text-blue-600">
                              {formatDistance(listing.distance)} away
                            </p>
                          )}
                        </div>
                        {listing.verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Listing Details */}
          {selectedListing && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Selected Listing</h3>
                <div className="space-y-3">
                  <img
                    src={selectedListing.image}
                    alt={selectedListing.title}
                    className="w-full h-32 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium">{selectedListing.title}</h4>
                    <p className="text-sm text-gray-600">{selectedListing.breed}</p>
                    <p className="text-lg font-semibold">{selectedListing.price}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      {selectedListing.location}
                      {selectedListing.distance && (
                        <span className="ml-2 text-blue-600">
                          ({formatDistance(selectedListing.distance)} away)
                        </span>
                      )}
                    </div>
                    {selectedListing.verified && (
                      <Badge variant="secondary" className="mt-2">Verified Seller</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">Contact Seller</Button>
                    <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nearby Listings */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">
                All Listings ({listings.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {listings.map((listing) => (
                  <div 
                    key={listing.id} 
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedListing(listing)}
                  >
                    <div className="flex gap-3">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{listing.title}</h4>
                        <p className="text-xs text-gray-600">{listing.breed} • {listing.price}</p>
                        {listing.distance && (
                          <p className="text-xs text-blue-600">
                            {formatDistance(listing.distance)}
                          </p>
                        )}
                      </div>
                      {listing.verified && (
                        <Badge variant="outline" className="text-xs">✓</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMapView;
