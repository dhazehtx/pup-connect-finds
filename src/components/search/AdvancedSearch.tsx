
import React, { useState } from 'react';
import { Search, MapPin, Filter, Sliders } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

interface SearchFilters {
  query: string;
  breed: string;
  location: string;
  radius: number;
  priceRange: [number, number];
  ageRange: [number, number];
  gender: string;
  size: string[];
  temperament: string[];
  healthCertified: boolean;
  pedigreed: boolean;
  verified: boolean;
  availability: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClose?: () => void;
}

const breeds = [
  'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Bulldog',
  'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
  'Siberian Husky', 'Shih Tzu', 'Boston Terrier', 'Pomeranian', 'Australian Shepherd'
];

const sizes = ['Small', 'Medium', 'Large', 'Extra Large'];
const temperaments = ['Friendly', 'Energetic', 'Calm', 'Playful', 'Protective', 'Independent'];

const AdvancedSearch = ({ onSearch, onClose }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    breed: '',
    location: '',
    radius: 25,
    priceRange: [0, 5000],
    ageRange: [0, 24],
    gender: '',
    size: [],
    temperament: [],
    healthCertified: false,
    pedigreed: false,
    verified: false,
    availability: 'all'
  });

  const handleSearch = () => {
    onSearch(filters);
    if (onClose) onClose();
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      breed: '',
      location: '',
      radius: 25,
      priceRange: [0, 5000],
      ageRange: [0, 24],
      gender: '',
      size: [],
      temperament: [],
      healthCertified: false,
      pedigreed: false,
      verified: false,
      availability: 'all'
    });
  };

  const toggleArrayFilter = (array: string[], value: string, setter: (value: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          Advanced Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="query">Search Keywords</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="query"
                placeholder="Search by name, description..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="breed">Breed</Label>
              <select
                id="breed"
                value={filters.breed}
                onChange={(e) => setFilters(prev => ({ ...prev, breed: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any breed</option>
                {breeds.map(breed => (
                  <option key={breed} value={breed}>{breed}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="City, State, ZIP"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Price and Age Range */}
        <div className="space-y-4">
          <div>
            <Label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
              max={5000}
              step={100}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} months</Label>
            <Slider
              value={filters.ageRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
              max={24}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Search Radius: {filters.radius} miles</Label>
            <Slider
              value={[filters.radius]}
              onValueChange={(value) => setFilters(prev => ({ ...prev, radius: value[0] }))}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <Label>Gender</Label>
          <RadioGroup
            value={filters.gender}
            onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}
            className="flex flex-row space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="any" />
              <Label htmlFor="any">Any</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Size */}
        <div>
          <Label>Size</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {sizes.map(size => (
              <Badge
                key={size}
                variant={filters.size.includes(size) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleArrayFilter(filters.size, size, (newSize) => 
                  setFilters(prev => ({ ...prev, size: newSize }))
                )}
              >
                {size}
              </Badge>
            ))}
          </div>
        </div>

        {/* Temperament */}
        <div>
          <Label>Temperament</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {temperaments.map(temp => (
              <Badge
                key={temp}
                variant={filters.temperament.includes(temp) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleArrayFilter(filters.temperament, temp, (newTemp) => 
                  setFilters(prev => ({ ...prev, temperament: newTemp }))
                )}
              >
                {temp}
              </Badge>
            ))}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="healthCertified"
              checked={filters.healthCertified}
              onCheckedChange={(checked) => 
                setFilters(prev => ({ ...prev, healthCertified: checked as boolean }))
              }
            />
            <Label htmlFor="healthCertified">Health Certified</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pedigreed"
              checked={filters.pedigreed}
              onCheckedChange={(checked) => 
                setFilters(prev => ({ ...prev, pedigreed: checked as boolean }))
              }
            />
            <Label htmlFor="pedigreed">Pedigreed</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={filters.verified}
              onCheckedChange={(checked) => 
                setFilters(prev => ({ ...prev, verified: checked as boolean }))
              }
            />
            <Label htmlFor="verified">Verified Breeder</Label>
          </div>
        </div>

        {/* Availability */}
        <div>
          <Label>Availability</Label>
          <RadioGroup
            value={filters.availability}
            onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}
            className="flex flex-row space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="available" id="available" />
              <Label htmlFor="available">Available Now</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="coming" id="coming" />
              <Label htmlFor="coming">Coming Soon</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
