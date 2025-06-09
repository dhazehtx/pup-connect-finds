
import React from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchFilters {
  query: string;
  breed: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minAge: number;
  maxAge: number;
}

interface QuickFilterSelectsProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: string | number) => void;
}

const QuickFilterSelects = ({ filters, onFilterChange }: QuickFilterSelectsProps) => {
  const popularBreeds = [
    'All Breeds',
    'Labrador Retriever',
    'Golden Retriever', 
    'German Shepherd',
    'Bulldog',
    'Poodle',
    'Beagle',
    'Rottweiler',
    'Yorkshire Terrier',
    'Dachshund',
    'Siberian Husky',
    'Great Dane',
    'Chihuahua',
    'Border Collie',
    'Boxer'
  ];

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={filters.breed} onValueChange={(value) => onFilterChange('breed', value === 'All Breeds' ? '' : value)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select breed" />
        </SelectTrigger>
        <SelectContent>
          {popularBreeds.map((breed) => (
            <SelectItem key={breed} value={breed}>
              {breed}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => onFilterChange('location', e.target.value)}
          className="pl-10 w-48"
        />
      </div>
    </div>
  );
};

export default QuickFilterSelects;
