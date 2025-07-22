
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface AdvancedFiltersProps {
  priceRange: [number, number];
  ageRange: [number, number];
  breeds: string[];
  verified: boolean;
  availableBreeds: string[];
  onPriceRangeChange: (range: [number, number]) => void;
  onAgeRangeChange: (range: [number, number]) => void;
  onBreedToggle: (breed: string) => void;
  onVerifiedToggle: () => void;
}

const AdvancedFilters = ({ 
  priceRange, 
  ageRange, 
  breeds, 
  verified, 
  availableBreeds,
  onPriceRangeChange, 
  onAgeRangeChange, 
  onBreedToggle, 
  onVerifiedToggle 
}: AdvancedFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price range */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </label>
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            max={10000}
            min={0}
            step={100}
            className="w-full"
          />
        </div>

        {/* Age range */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Age Range: {ageRange[0]} - {ageRange[1]} months
          </label>
          <Slider
            value={ageRange}
            onValueChange={(value) => onAgeRangeChange(value as [number, number])}
            max={36}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        {/* Breeds */}
        <div>
          <label className="text-sm font-medium mb-2 block">Popular Breeds</label>
          <div className="flex flex-wrap gap-2">
            {availableBreeds.slice(0, 8).map(breed => (
              <Badge
                key={breed}
                variant={breeds.includes(breed) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onBreedToggle(breed)}
              >
                {breed}
              </Badge>
            ))}
          </div>
        </div>

        {/* Verified toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="verified"
            checked={verified}
            onChange={(e) => onVerifiedToggle()}
            className="rounded"
          />
          <label htmlFor="verified" className="text-sm">
            Verified breeders only
          </label>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;
