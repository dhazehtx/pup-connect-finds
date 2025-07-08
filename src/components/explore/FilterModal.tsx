
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FilterState {
  breed: string;
  gender: string;
  size: string;
  color: string;
  minPrice: string;
  maxPrice: string;
  location: string;
  vaccinated: boolean;
  neutered_spayed: boolean;
  good_with_kids: boolean;
  good_with_dogs: boolean;
  delivery_available: boolean;
  rehoming: boolean;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterUpdate: (key: string, value: any) => void;
  onClearAllFilters: () => void;
  onApplyFilters: () => void;
  popularBreeds: string[];
}

const FilterModal = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFilterUpdate, 
  onClearAllFilters,
  onApplyFilters,
  popularBreeds 
}: FilterModalProps) => {
  const [priceRange, setPriceRange] = React.useState([
    parseInt(filters.minPrice) || 0,
    parseInt(filters.maxPrice) || 5000
  ]);

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    onFilterUpdate('minPrice', values[0].toString());
    onFilterUpdate('maxPrice', values[1].toString());
  };

  const handleApplyAndClose = () => {
    onApplyFilters();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Filter Listings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Breed Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Breed</Label>
            <Select value={filters.breed} onValueChange={(value) => onFilterUpdate('breed', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a breed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any breed</SelectItem>
                {popularBreeds.map(breed => (
                  <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Gender</Label>
            <Select value={filters.gender} onValueChange={(value) => onFilterUpdate('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Size Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Size</Label>
            <Select value={filters.size} onValueChange={(value) => onFilterUpdate('size', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any size</SelectItem>
                <SelectItem value="Small">Small</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </Label>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={10000}
                min={0}
                step={50}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0</span>
              <span>$10,000+</span>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Location</Label>
            <Input
              placeholder="Enter ZIP code or city"
              value={filters.location}
              onChange={(e) => onFilterUpdate('location', e.target.value)}
            />
          </div>

          {/* Health & Behavior Checkboxes */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Health & Behavior</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vaccinated"
                  checked={filters.vaccinated}
                  onCheckedChange={(checked) => onFilterUpdate('vaccinated', checked)}
                />
                <Label htmlFor="vaccinated" className="text-sm">Vaccinated</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="neutered_spayed"
                  checked={filters.neutered_spayed}
                  onCheckedChange={(checked) => onFilterUpdate('neutered_spayed', checked)}
                />
                <Label htmlFor="neutered_spayed" className="text-sm">Neutered/Spayed</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="good_with_kids"
                  checked={filters.good_with_kids}
                  onCheckedChange={(checked) => onFilterUpdate('good_with_kids', checked)}
                />
                <Label htmlFor="good_with_kids" className="text-sm">Good with Kids</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="good_with_dogs"
                  checked={filters.good_with_dogs}
                  onCheckedChange={(checked) => onFilterUpdate('good_with_dogs', checked)}
                />
                <Label htmlFor="good_with_dogs" className="text-sm">Good with Dogs</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delivery_available"
                  checked={filters.delivery_available}
                  onCheckedChange={(checked) => onFilterUpdate('delivery_available', checked)}
                />
                <Label htmlFor="delivery_available" className="text-sm">Delivery Available</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rehoming"
                  checked={filters.rehoming}
                  onCheckedChange={(checked) => onFilterUpdate('rehoming', checked)}
                />
                <Label htmlFor="rehoming" className="text-sm">Rehoming Only</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" onClick={onClearAllFilters}>
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApplyAndClose}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
