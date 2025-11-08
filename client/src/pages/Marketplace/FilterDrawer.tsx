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
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-32">
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
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Categories</h3>
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
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Price Range</h3>
            <div className="px-2">
              <Slider
                value={[localFilters.minPrice, localFilters.maxPrice]}
                onValueChange={handlePriceChange}
                max={maxProductPrice}
                min={minProductPrice}
                step={1}
                className="mb-3"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>${localFilters.minPrice}</span>
                <span>${localFilters.maxPrice}</span>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              {localFilters.categories.length > 0 && (
                <div className="mb-1">Categories: {localFilters.categories.join(', ')}</div>
              )}
              <div>Price: ${localFilters.minPrice} - ${localFilters.maxPrice}</div>
            </div>
          </div>
        </div>
        
        {/* Sticky Action Buttons */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-3">
          <Button
            onClick={handleApply}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-2.5"
            data-testid="button-apply-filters"
          >
            Apply Filters
          </Button>
          <button
            onClick={handleClear}
            className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium"
            data-testid="button-clear-filters"
          >
            Clear All
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;