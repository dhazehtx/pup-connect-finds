
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Filter, Bell, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdvancedSearchFilters = ({ onSearch, onSaveSearch }: { 
  onSearch: (filters: any) => void;
  onSaveSearch?: (filters: any, name: string) => void;
}) => {
  const [filters, setFilters] = useState({
    query: '',
    breeds: [] as string[],
    priceRange: [0, 5000],
    ageRange: [0, 24],
    location: '',
    locationRadius: 50,
    verifiedSellersOnly: false,
    healthCertified: false,
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const { toast } = useToast();

  const popularBreeds = [
    'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
    'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Siberian Husky'
  ];

  const handleBreedToggle = (breed: string) => {
    setFilters(prev => ({
      ...prev,
      breeds: prev.breeds.includes(breed)
        ? prev.breeds.filter(b => b !== breed)
        : [...prev.breeds, breed]
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleSaveSearch = () => {
    if (!saveSearchName.trim()) {
      toast({
        title: "Search name required",
        description: "Please enter a name for your saved search",
        variant: "destructive"
      });
      return;
    }

    if (onSaveSearch) {
      onSaveSearch(filters, saveSearchName);
      setSaveSearchName('');
      setShowSaveSearch(false);
      toast({
        title: "Search saved",
        description: "You'll be notified when new listings match your criteria",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      breeds: [],
      priceRange: [0, 5000],
      ageRange: [0, 24],
      location: '',
      locationRadius: 50,
      verifiedSellersOnly: false,
      healthCertified: false,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter size={20} />
          Advanced Search Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Query */}
        <div>
          <Label htmlFor="searchQuery">Search Keywords</Label>
          <div className="relative mt-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="searchQuery"
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              placeholder="Search by name, description, or keywords..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Breed Selection */}
        <div>
          <Label>Breeds</Label>
          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-2">
              {filters.breeds.map(breed => (
                <Badge key={breed} variant="secondary" className="flex items-center gap-1">
                  {breed}
                  <X 
                    size={12} 
                    className="cursor-pointer" 
                    onClick={() => handleBreedToggle(breed)}
                  />
                </Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {popularBreeds.map(breed => (
                <div key={breed} className="flex items-center space-x-2">
                  <Checkbox
                    id={breed}
                    checked={filters.breeds.includes(breed)}
                    onCheckedChange={() => handleBreedToggle(breed)}
                  />
                  <Label htmlFor={breed} className="text-sm">{breed}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Label>
          <div className="mt-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
              max={5000}
              min={0}
              step={100}
              className="w-full"
            />
          </div>
        </div>

        {/* Age Range */}
        <div>
          <Label>Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} months</Label>
          <div className="mt-2">
            <Slider
              value={filters.ageRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value }))}
              max={24}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Location</Label>
          <div className="relative mt-1">
            <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="location"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, State or ZIP code"
              className="pl-10"
            />
          </div>
          {filters.location && (
            <div className="mt-2">
              <Label>Search Radius: {filters.locationRadius} miles</Label>
              <Slider
                value={[filters.locationRadius]}
                onValueChange={(value) => setFilters(prev => ({ ...prev, locationRadius: value[0] }))}
                max={200}
                min={5}
                step={5}
                className="w-full mt-1"
              />
            </div>
          )}
        </div>

        {/* Additional Filters */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verifiedSellers"
              checked={filters.verifiedSellersOnly}
              onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verifiedSellersOnly: !!checked }))}
            />
            <Label htmlFor="verifiedSellers">Verified sellers only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="healthCertified"
              checked={filters.healthCertified}
              onCheckedChange={(checked) => setFilters(prev => ({ ...prev, healthCertified: !!checked }))}
            />
            <Label htmlFor="healthCertified">Health certified</Label>
          </div>
        </div>

        {/* Sort Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Sort by</Label>
            <Select 
              value={filters.sortBy} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Posted</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="age">Age</SelectItem>
                <SelectItem value="dog_name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Order</Label>
            <Select 
              value={filters.sortOrder} 
              onValueChange={(value: 'asc' | 'desc') => setFilters(prev => ({ ...prev, sortOrder: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="mr-2" size={16} />
            Search
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            Clear
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowSaveSearch(!showSaveSearch)}
          >
            <Bell className="mr-2" size={16} />
            Save
          </Button>
        </div>

        {/* Save Search */}
        {showSaveSearch && (
          <div className="border-t pt-4 space-y-2">
            <Label htmlFor="saveSearchName">Save Search Alert</Label>
            <Input
              id="saveSearchName"
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="Name your search (e.g., 'Golden Retriever under $2000')"
            />
            <Button onClick={handleSaveSearch} size="sm">
              Save Search Alert
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchFilters;
