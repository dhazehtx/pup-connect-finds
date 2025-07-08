
import React from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useBreedColors } from '@/hooks/useBreedColors';

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

interface CollapsibleFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterUpdate: (key: string, value: any) => void;
  onClearAllFilters: () => void;
  onApplyFilters: () => void;
  popularBreeds: string[];
  sortBy: string;
  onSortChange: (value: string) => void;
}

const CollapsibleFiltersPanel = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFilterUpdate, 
  onClearAllFilters,
  onApplyFilters,
  popularBreeds,
  sortBy,
  onSortChange
}: CollapsibleFiltersPanelProps) => {
  const [priceRange, setPriceRange] = React.useState([
    parseInt(filters.minPrice) || 0,
    parseInt(filters.maxPrice) || 5000
  ]);

  // Get breed-specific colors
  const { colors: breedColors, loading: colorsLoading } = useBreedColors(filters.breed);

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    onFilterUpdate('minPrice', values[0].toString());
    onFilterUpdate('maxPrice', values[1].toString());
  };

  // Handle breed change and reset color if needed
  const handleBreedChange = (value: string) => {
    const breedValue = value === "all" ? "" : value;
    onFilterUpdate('breed', breedValue);
    
    // Reset color when breed changes
    if (filters.color && breedValue) {
      onFilterUpdate('color', '');
    }
  };

  // Handle color change
  const handleColorChange = (value: string) => {
    onFilterUpdate('color', value === "all" ? "" : value);
  };

  // Determine which colors to show
  const getAvailableColors = () => {
    if (!filters.breed || filters.breed === '') {
      // No breed selected - show default colors
      return [
        'Black',
        'White', 
        'Brown',
        'Tan',
        'Brindle',
        'Merle',
        'Cream',
        'Gray',
        'Mixed'
      ];
    }
    
    // Breed selected - show breed-specific colors or fallback
    return breedColors.length > 0 ? breedColors : [
      'Black',
      'White', 
      'Brown',
      'Tan',
      'Brindle',
      'Merle',
      'Cream',
      'Gray',
      'Mixed'
    ];
  };

  const availableColors = getAvailableColors();

  if (!isOpen) return null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header with Sort By */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Sort by:</Label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="age-young">Youngest first</SelectItem>
                  <SelectItem value="distance">Nearest first</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Basic Filters Row */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Breed</Label>
            <Select value={filters.breed || "all"} onValueChange={handleBreedChange}>
              <SelectTrigger>
                <SelectValue placeholder="Any breed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any breed</SelectItem>
                {popularBreeds.map(breed => (
                  <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Gender</Label>
            <Select value={filters.gender || "all"} onValueChange={(value) => onFilterUpdate('gender', value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Size</Label>
            <Select value={filters.size || "all"} onValueChange={(value) => onFilterUpdate('size', value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any size</SelectItem>
                <SelectItem value="Small">Small</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Second Row - Color, Price Range, Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Color
              {filters.breed && colorsLoading && (
                <span className="text-xs text-gray-500 ml-1">(loading...)</span>
              )}
            </Label>
            <Select 
              value={filters.color || "all"} 
              onValueChange={handleColorChange}
              disabled={colorsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  filters.breed && !colorsLoading 
                    ? `Select color for ${filters.breed}` 
                    : "All colors"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All colors</SelectItem>
                {availableColors.map(color => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
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
            <div className="flex justify-between text-xs text-gray-500">
              <span>$0</span>
              <span>$10,000+</span>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Location</Label>
            <Input
              placeholder="ZIP code or city"
              value={filters.location}
              onChange={(e) => onFilterUpdate('location', e.target.value)}
            />
          </div>
        </div>

        {/* Health & Behavior Checkboxes */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Health & Behavior</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClearAllFilters}>
            Clear All Filters
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                onApplyFilters();
                onClose();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleFiltersPanel;
