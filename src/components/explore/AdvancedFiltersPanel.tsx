
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin } from 'lucide-react';

interface AdvancedFiltersPanelProps {
  filters: any;
  popularBreeds: string[];
  dogColors: string[];
  coatLengthOptions: string[];
  distanceOptions: string[];
  sizeOptions: string[];
  energyLevels: string[];
  trainingLevels: string[];
  onFilterUpdate: (key: string, value: any) => void;
  onClearAllFilters: () => void;
}

const AdvancedFiltersPanel = ({ 
  filters, 
  popularBreeds, 
  dogColors, 
  coatLengthOptions, 
  distanceOptions, 
  sizeOptions, 
  energyLevels, 
  trainingLevels, 
  onFilterUpdate, 
  onClearAllFilters 
}: AdvancedFiltersPanelProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Advanced Filters</h3>
          <Button variant="outline" size="sm" onClick={onClearAllFilters}>
            Clear All
          </Button>
        </div>

        {/* Sort Options - At the top */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <Select value={filters.sortBy} onValueChange={(value) => onFilterUpdate('sortBy', value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="age-young">Age: Youngest First</SelectItem>
              <SelectItem value="age-old">Age: Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Basic Filters Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
            <Select value={filters.breed} onValueChange={(value) => onFilterUpdate('breed', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Breeds">All Breeds</SelectItem>
                {popularBreeds.map(breed => (
                  <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <Select value={filters.source} onValueChange={(value) => onFilterUpdate('source', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Sources">All Sources</SelectItem>
                <SelectItem value="Breeders">Breeders</SelectItem>
                <SelectItem value="Shelters">Shelters</SelectItem>
                <SelectItem value="Kill Shelter">Kill Shelter</SelectItem>
                <SelectItem value="Rescue">Rescue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
            <Select value={filters.ageGroup} onValueChange={(value) => onFilterUpdate('ageGroup', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Ages">All Ages</SelectItem>
                <SelectItem value="Puppies (0-1 year)">Puppies (0-1 year)</SelectItem>
                <SelectItem value="Young (1-3 years)">Young (1-3 years)</SelectItem>
                <SelectItem value="Adult (3+ years)">Adult (3+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <Select value={filters.gender} onValueChange={(value) => onFilterUpdate('gender', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Genders">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <Select value={filters.color} onValueChange={(value) => onFilterUpdate('color', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Colors">All Colors</SelectItem>
                {dogColors.map(color => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coat Length</label>
            <Select value={filters.coatLength} onValueChange={(value) => onFilterUpdate('coatLength', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Coat Types">All Coat Types</SelectItem>
                {coatLengthOptions.map(coatType => (
                  <SelectItem key={coatType} value={coatType}>{coatType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => onFilterUpdate('priceRange', value)}
            max={10000}
            min={0}
            step={100}
            className="w-full"
          />
        </div>

        {/* Age and Location */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar size={14} />
              Min Age (weeks)
            </label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minAge}
              onChange={(e) => onFilterUpdate('minAge', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar size={14} />
              Max Age (weeks)
            </label>
            <Input
              type="number"
              placeholder="104"
              value={filters.maxAge}
              onChange={(e) => onFilterUpdate('maxAge', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPin size={14} />
              Location
            </label>
            <Input
              placeholder="City, State"
              value={filters.location}
              onChange={(e) => onFilterUpdate('location', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
            <Select value={filters.maxDistance} onValueChange={(value) => onFilterUpdate('maxDistance', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any distance">Any distance</SelectItem>
                {distanceOptions.map(distance => (
                  <SelectItem key={distance} value={distance}>{distance} miles</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
            <Select value={filters.size} onValueChange={(value) => onFilterUpdate('size', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any Size">Any Size</SelectItem>
                {sizeOptions.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Training Level</label>
            <Select value={filters.trainingLevel} onValueChange={(value) => onFilterUpdate('trainingLevel', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any Level</SelectItem>
                {trainingLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Energy Level</label>
            <Select value={filters.energyLevel} onValueChange={(value) => onFilterUpdate('energyLevel', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any Level</SelectItem>
                {energyLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paperwork</label>
            <Select value={filters.paperwork} onValueChange={(value) => onFilterUpdate('paperwork', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="AKC Registered">AKC Registered</SelectItem>
                <SelectItem value="Champion Bloodline">Champion Bloodline</SelectItem>
                <SelectItem value="Health Certificate">Health Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => onFilterUpdate('verifiedOnly', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Verified only</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.availableNow}
              onChange={(e) => onFilterUpdate('availableNow', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Available now</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.healthChecked}
              onChange={(e) => onFilterUpdate('healthChecked', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Health checked</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.vaccinated}
              onChange={(e) => onFilterUpdate('vaccinated', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Vaccinated</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.spayedNeutered}
              onChange={(e) => onFilterUpdate('spayedNeutered', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Spayed/Neutered</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.goodWithKids}
              onChange={(e) => onFilterUpdate('goodWithKids', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Good with kids</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.goodWithPets}
              onChange={(e) => onFilterUpdate('goodWithPets', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Good with pets</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFiltersPanel;
