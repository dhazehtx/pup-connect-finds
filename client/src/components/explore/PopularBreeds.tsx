
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PopularBreedsProps {
  popularBreeds: string[];
  selectedBreed: string;
  onBreedSelect: (breed: string) => void;
}

const PopularBreeds = ({ popularBreeds, selectedBreed, onBreedSelect }: PopularBreedsProps) => {
  return (
    <div className="bg-white px-4 py-4 border-b border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Breeds</h3>
      <div className="flex flex-wrap gap-2">
        {popularBreeds.slice(0, 8).map((breed) => (
          <Badge
            key={breed}
            variant={selectedBreed === breed ? "default" : "outline"}
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => onBreedSelect(breed)}
          >
            {breed}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default PopularBreeds;
