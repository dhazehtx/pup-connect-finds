
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, MapPin } from 'lucide-react';

interface ActiveFiltersProps {
  breeds: string[];
  verified: boolean;
  location?: any;
  onBreedRemove: (breed: string) => void;
  onVerifiedToggle: () => void;
  onLocationRemove: () => void;
  onClearAll: () => void;
}

const ActiveFilters = ({ 
  breeds, 
  verified, 
  location, 
  onBreedRemove, 
  onVerifiedToggle, 
  onLocationRemove, 
  onClearAll 
}: ActiveFiltersProps) => {
  const hasFilters = breeds.length > 0 || verified || location;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {breeds.map(breed => (
        <Badge key={breed} variant="secondary" className="flex items-center gap-1">
          {breed}
          <X 
            className="w-3 h-3 cursor-pointer" 
            onClick={() => onBreedRemove(breed)}
          />
        </Badge>
      ))}
      {verified && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Verified only
          <X 
            className="w-3 h-3 cursor-pointer" 
            onClick={onVerifiedToggle}
          />
        </Badge>
      )}
      {location && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {location.address}
          <X 
            className="w-3 h-3 cursor-pointer" 
            onClick={onLocationRemove}
          />
        </Badge>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-6 px-2 text-xs"
      >
        Clear all
      </Button>
    </div>
  );
};

export default ActiveFilters;
