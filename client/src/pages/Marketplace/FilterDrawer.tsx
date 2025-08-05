import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating?: number;
  reviews?: number;
  image: string;
  description: string;
  inStock: boolean;
}

interface FilterState {
  categories: string[];
  minPrice: number;
  maxPrice: number;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApply,
  onClear
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Static categories for filtering
  const categories = ['Toys', 'Accessories', 'Food & Treats', 'Other'];
  
  // Static price range
  const minProductPrice = 0;
  const maxProductPrice = 100;

  const handleCategoryChange = (category: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handlePriceChange = (values: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1]
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      categories: [],
      minPrice: minProductPrice,
      maxPrice: maxProductPrice
    };
    setLocalFilters(clearedFilters);
    onClear();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Filter Products</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Categories Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-3">
              {categories.map(category => {
                const isChecked = localFilters.categories.includes(category);
                
                return (
                  <div key={category} className="flex items-center space-x-3">
                    <Checkbox
                      id={category}
                      checked={isChecked}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(category, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={category}
                      className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                    >
                      {category}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Range Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
            <div className="px-2">
              <Slider
                value={[localFilters.minPrice, localFilters.maxPrice]}
                onValueChange={handlePriceChange}
                max={maxProductPrice}
                min={minProductPrice}
                step={1}
                className="mb-4"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>${localFilters.minPrice}</span>
                <span>${localFilters.maxPrice}</span>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              {localFilters.categories.length > 0 && (
                <div className="mb-2">Categories: {localFilters.categories.join(', ')}</div>
              )}
              <div>Price: ${localFilters.minPrice} - ${localFilters.maxPrice}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleApply}
              className="w-full btn-primary"
            >
              Apply Filters
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="w-full"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;