
import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, MapPin, MessageCircle, Sliders, Plus, Home, User, DollarSign, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
    color: 'All Colors',
    coatLength: 'All Coat Types',
    minPrice: 0,
    maxPrice: 10000,
    priceRange: [0, 10000],
    minAge: '',
    maxAge: '',
    location: '',
    maxDistance: 'Any distance',
    verifiedOnly: false,
    availableNow: false,
    healthChecked: false,
    vaccinated: false,
    spayedNeutered: false,
    paperwork: 'Any',
    trainingLevel: 'Any',
    size: 'Any Size',
    energyLevel: 'Any',
    goodWithKids: false,
    goodWithPets: false,
    sortBy: 'newest'
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

    if (filters.maxDistance !== 'Any distance') {
      const maxDist = parseInt(filters.maxDistance);
      filtered = filtered.filter(listing => {
        const listingDistance = parseFloat(listing.distance);
        return listingDistance <= maxDist;
      });
    }

    // Price range filter
    const minPrice = filters.priceRange[0];
    const maxPrice = filters.priceRange[1];
    filtered = filtered.filter(listing => {
      const price = parseInt(listing.price.replace(/[$,]/g, ''));
      return price >= minPrice && price <= maxPrice;
    });

    // Age filters
    if (filters.minAge) {
      filtered = filtered.filter(listing => {
        const ageWeeks = parseInt(listing.age);
        return ageWeeks >= parseInt(filters.minAge);
      });
    }

    if (filters.maxAge) {
      filtered = filtered.filter(listing => {
        const ageWeeks = parseInt(listing.age);
        return ageWeeks <= parseInt(filters.maxAge);
      });
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(listing => 
        listing.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.verifiedOnly) {
      filtered = filtered.filter(listing => listing.verified);
    }
    
    setFilteredListings(filtered);
  }, [searchTerm, filters]);

  // Most popular dog breeds in the US based on AKC registration data
  const popularBreeds = [
    'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'French Bulldog', 'Bulldog', 
    'Poodle', 'Beagle', 'Rottweiler', 'German Shorthaired Pointer', 'Yorkshire Terrier',
    'Australian Shepherd', 'Siberian Husky', 'Dachshund', 'Pembroke Welsh Corgi', 'Boston Terrier',
    'Border Collie', 'Great Dane', 'Boxer', 'Bernese Mountain Dog', 'Cocker Spaniel',
    'Chihuahua', 'Shih Tzu', 'Miniature Schnauzer', 'Mastiff', 'Australian Cattle Dog',
    'Cane Corso', 'English Springer Spaniel', 'Brittany', 'Pomeranian', 'Maltese',
    'Cavalier King Charles Spaniel', 'Weimaraner', 'Belgian Malinois', 'Newfoundland', 'Rhodesian Ridgeback',
    'West Highland White Terrier', 'Havanese', 'Bichon Frise', 'Akita', 'Bloodhound',
    'Doberman Pinscher', 'Vizsla', 'Collie', 'Papillon', 'Samoyed',
    'Basset Hound', 'Jack Russell Terrier', 'Saint Bernard', 'Great Pyrenees', 'Portuguese Water Dog',
    'Dapple', 'Mixed Breed'
  ];

  const quickFilters = ['Under $1000', 'Puppies Only', 'Verified Only', 'Nearby (10mi)', 'Health Checked', 'Vaccinated'];
  const distanceOptions = ['5', '10', '25', '50', '100'];
  const sizeOptions = ['Toy (under 10 lbs)', 'Small (10-25 lbs)', 'Medium (25-60 lbs)', 'Large (60-90 lbs)', 'Giant (over 90 lbs)'];
  const energyLevels = ['Low', 'Moderate', 'High', 'Very High'];
  const trainingLevels = ['Untrained', 'Basic', 'Intermediate', 'Advanced'];
  const coatLengthOptions = ['Short Hair', 'Medium Hair', 'Long Hair'];
  const dogColors = [
    'Black', 'White', 'Brown', 'Golden', 'Cream', 'Red', 'Blue', 'Gray', 'Silver', 'Tan', 
    'Brindle', 'Sable', 'Merle', 'Tri-color', 'Bi-color', 'Spotted', 'Parti-color', 
    'Chocolate', 'Liver', 'Fawn', 'Apricot', 'Champagne', 'Platinum', 'Salt and Pepper'
  ];

  const handleContactSeller = async (listing: any) => {
    if (!user && !isGuest) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact sellers",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    toast({
      title: "Message sent!",
      description: `Contacting ${listing.breeder} about ${listing.title}`,
    });
  };

  const toggleFavorite = (listingId: number) => {
    if (!user && !isGuest) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

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

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      breed: 'All Breeds',
      source: 'All Sources', 
      ageGroup: 'All Ages',
      gender: 'All Genders',
      color: 'All Colors',
      coatLength: 'All Coat Types',
      minPrice: 0,
      maxPrice: 10000,
      priceRange: [0, 10000],
      minAge: '',
      maxAge: '',
      location: '',
      maxDistance: 'Any distance',
      verifiedOnly: false,
      availableNow: false,
      healthChecked: false,
      vaccinated: false,
      spayedNeutered: false,
      paperwork: 'Any',
      trainingLevel: 'Any',
      size: 'Any Size',
      energyLevel: 'Any',
      goodWithKids: false,
      goodWithPets: false,
      sortBy: 'newest'
    });
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with logo and search */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">MY PUP</span>
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
            {popularBreeds.slice(0, 8).map((breed) => (
              <Badge
                key={breed}
                variant={filters.breed === breed ? "default" : "outline"}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => updateFilter('breed', breed)}
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
                  if (filter === 'Under $1000') {
                    updateFilter('priceRange', [0, 1000]);
                  } else if (filter === 'Puppies Only') {
                    updateFilter('ageGroup', 'Puppies (0-1 year)');
                  } else if (filter === 'Verified Only') {
                    updateFilter('verifiedOnly', !filters.verifiedOnly);
                  } else if (filter === 'Nearby (10mi)') {
                    updateFilter('maxDistance', '10');
                  } else if (filter === 'Health Checked') {
                    updateFilter('healthChecked', !filters.healthChecked);
                  } else if (filter === 'Vaccinated') {
                    updateFilter('vaccinated', !filters.vaccinated);
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
        <div className="bg-white border-b border-gray-200 px-4 py-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Advanced Filters</h3>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>

            {/* Basic Filters Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <Select value={filters.breed} onValueChange={(value) => updateFilter('breed', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Breeds">All Breeds</SelectItem>
                    {popularBreeds.map(breed => (
                      <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <Select value={filters.source} onValueChange={(value) => updateFilter('source', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Sources">All Sources</SelectItem>
                    <SelectItem value="Breeders">Breeders</SelectItem>
                    <SelectItem value="Shelters">Shelters</SelectItem>
                    <SelectItem value="Kill Shelter">Kill Shelter</SelectItem>
                    <SelectItem value="Rescue">Rescue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                <Select value={filters.ageGroup} onValueChange={(value) => updateFilter('ageGroup', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Ages">All Ages</SelectItem>
                    <SelectItem value="Puppies (0-1 year)">Puppies (0-1 year)</SelectItem>
                    <SelectItem value="Young (1-3 years)">Young (1-3 years)</SelectItem>
                    <SelectItem value="Adult (3+ years)">Adult (3+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <Select value={filters.gender} onValueChange={(value) => updateFilter('gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Genders">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <Select value={filters.color} onValueChange={(value) => updateFilter('color', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Colors">All Colors</SelectItem>
                    {dogColors.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coat Length</label>
                <Select value={filters.coatLength} onValueChange={(value) => updateFilter('coatLength', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Coat Types">All Coat Types</SelectItem>
                    {coatLengthOptions.map(coatType => (
                      <SelectItem key={coatType} value={coatType}>{coatType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value)}
                max={10000}
                min={0}
                step={100}
                className="w-full"
              />
            </div>

            {/* Age and Location */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar size={14} />
                  Min Age (weeks)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minAge}
                  onChange={(e) => updateFilter('minAge', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar size={14} />
                  Max Age (weeks)
                </label>
                <Input
                  type="number"
                  placeholder="104"
                  value={filters.maxAge}
                  onChange={(e) => updateFilter('maxAge', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin size={14} />
                  Location
                </label>
                <Input
                  placeholder="City, State"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
                <Select value={filters.maxDistance} onValueChange={(value) => updateFilter('maxDistance', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any distance">Any distance</SelectItem>
                    {distanceOptions.map(distance => (
                      <SelectItem key={distance} value={distance}>{distance} miles</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <Select value={filters.size} onValueChange={(value) => updateFilter('size', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any Size">Any Size</SelectItem>
                    {sizeOptions.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Level</label>
                <Select value={filters.trainingLevel} onValueChange={(value) => updateFilter('trainingLevel', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any Level</SelectItem>
                    {trainingLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Energy Level</label>
                <Select value={filters.energyLevel} onValueChange={(value) => updateFilter('energyLevel', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any Level</SelectItem>
                    {energyLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paperwork</label>
                <Select value={filters.paperwork} onValueChange={(value) => updateFilter('paperwork', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="AKC Registered">AKC Registered</SelectItem>
                    <SelectItem value="Champion Bloodline">Champion Bloodline</SelectItem>
                    <SelectItem value="Health Certificate">Health Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Verified only</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.availableNow}
                  onChange={(e) => updateFilter('availableNow', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Available now</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.healthChecked}
                  onChange={(e) => updateFilter('healthChecked', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Health checked</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.vaccinated}
                  onChange={(e) => updateFilter('vaccinated', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Vaccinated</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.spayedNeutered}
                  onChange={(e) => updateFilter('spayedNeutered', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Spayed/Neutered</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.goodWithKids}
                  onChange={(e) => updateFilter('goodWithKids', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Good with kids</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.goodWithPets}
                  onChange={(e) => updateFilter('goodWithPets', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Good with pets</span>
              </label>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="age-young">Age: Youngest First</SelectItem>
                  <SelectItem value="age-old">Age: Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="px-4 py-3 bg-white border-b">
        <p className="text-sm text-gray-600">
          {filteredListings.length} puppies found
          {filters.maxDistance !== 'Any distance' && ` within ${filters.maxDistance} miles`}
        </p>
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
                  <span>•</span>
                  <span>{listing.distance} mi</span>
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
