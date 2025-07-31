import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface Filters {
  breed?: string;
  gender?: string;
  price?: number;
  age?: number;
  location?: string;
}

interface PillFilterBarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const PillFilterBar: React.FC<PillFilterBarProps> = ({ filters, setFilters }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const breeds = ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle', 'Beagle', 'French Bulldog', 'Border Collie'];
  const genders = ['Male', 'Female'];
  const prices = [500, 1000, 1500, 2000, 3000, 5000];
  const ages = [8, 12, 16, 24, 36]; // weeks
  const locations = ['California', 'Texas', 'Florida', 'New York', 'Washington', 'Arizona'];

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters({ ...filters, [key]: value });
    setOpenDropdown(null);
  };

  const PillButton = ({ 
    label, 
    dropdown, 
    currentValue, 
    options, 
    renderOption 
  }: {
    label: string;
    dropdown: string;
    currentValue: any;
    options: any[];
    renderOption: (option: any) => React.ReactNode;
  }) => (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => toggleDropdown(dropdown)}
        className={`flex items-center gap-1 ${currentValue ? 'bg-blue-50 border-blue-500 text-blue-700' : ''}`}
      >
        {label} {currentValue && `(${currentValue})`}
        <ChevronDown className="h-3 w-3" />
      </Button>
      
      {openDropdown === dropdown && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-40">
          <div className="py-1 max-h-60 overflow-y-auto">
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              onClick={() => handleFilterChange(dropdown as keyof Filters, undefined)}
            >
              All {label}s
            </button>
            {options.map((option, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleFilterChange(dropdown as keyof Filters, option)}
              >
                {renderOption(option)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      <PillButton
        label="Breed"
        dropdown="breed"
        currentValue={filters.breed}
        options={breeds}
        renderOption={(breed) => breed}
      />
      
      <PillButton
        label="Gender"
        dropdown="gender"
        currentValue={filters.gender}
        options={genders}
        renderOption={(gender) => gender}
      />
      
      <PillButton
        label="Price"
        dropdown="price"
        currentValue={filters.price ? `Under $${filters.price}` : null}
        options={prices}
        renderOption={(price) => `Under $${price}`}
      />
      
      <PillButton
        label="Age"
        dropdown="age"
        currentValue={filters.age ? `Under ${filters.age} weeks` : null}
        options={ages}
        renderOption={(age) => `Under ${age} weeks`}
      />
      
      <PillButton
        label="Location"
        dropdown="location"
        currentValue={filters.location}
        options={locations}
        renderOption={(location) => location}
      />

      {/* Clear filters button */}
      {Object.keys(filters).some(key => filters[key as keyof Filters]) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilters({})}
          className="text-gray-500 hover:text-gray-700"
        >
          Clear all
        </Button>
      )}
    </div>
  );
};

export default PillFilterBar;