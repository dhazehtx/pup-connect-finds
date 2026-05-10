import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useBreeds, useColorsByBreed } from '@/hooks/useBreedColorOptions';
import { EXPLORE_DEFAULT_FILTERS, useExploreFilters } from '@/context/ExploreFiltersContext';

export default function AdvancedFilters() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { filters, setFilters } = useExploreFilters();
  const { data: breeds } = useBreeds();
  const { data: colors } = useColorsByBreed(filters.breedId);

  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, price: [value[0], value[1]] }));
  };

  const handleToggleChange = (key: keyof typeof filters.toggles, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      toggles: { ...prev.toggles, [key]: checked }
    }));
  };

  const clearAllFilters = () => {
    setFilters(structuredClone(EXPLORE_DEFAULT_FILTERS));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 h-8 w-8 text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
          </Button>
        </div>
        {isExpanded && (
          <Button variant="outline" onClick={clearAllFilters} className="text-sm">
            Clear All
          </Button>
        )}
      </div>

      {!isExpanded && (
        <p className="text-gray-500 text-sm">
          Click to expand advanced search options
        </p>
      )}

      {isExpanded && (
        <div>

      {/* Sort By */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</Label>
        <Select
          value={filters.sort}
          onValueChange={(value: 'newest' | 'price_low' | 'price_high' | 'featured') =>
            setFilters(prev => ({ ...prev, sort: value }))
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {/* Breed */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Breed</Label>
          <Select
            value={filters.breedId?.toString() || 'all'}
            onValueChange={(value) =>
              setFilters(prev => ({
                ...prev,
                breedId: value === 'all' ? null : parseInt(value),
                color: null // Reset color when breed changes
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Breeds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Breeds</SelectItem>
              {breeds?.slice(0, 50).map((breed: any) => (
                <SelectItem key={breed.id} value={breed.id.toString()}>
                  {breed.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Source</Label>
          <Select
            value={filters.source || 'all'}
            onValueChange={(value) =>
              setFilters(prev => ({ ...prev, source: value === 'all' ? null : value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="breeder">Breeder</SelectItem>
              <SelectItem value="rescue">Rescue</SelectItem>
              <SelectItem value="shelter">Shelter</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Age Group */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Age Group</Label>
          <Select
            value={filters.age.minWeeks === 0 && filters.age.maxWeeks === 104 ? 'all' : `${filters.age.minWeeks}-${filters.age.maxWeeks}`}
            onValueChange={(value) => {
              if (value === 'all') {
                setFilters(prev => ({ ...prev, age: { minWeeks: 0, maxWeeks: 104 } }));
              } else {
                const [min, max] = value.split('-').map(Number);
                setFilters(prev => ({ ...prev, age: { minWeeks: min, maxWeeks: max } }));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Ages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              <SelectItem value="0-8">Puppy (0-8 weeks)</SelectItem>
              <SelectItem value="8-16">Young (8-16 weeks)</SelectItem>
              <SelectItem value="16-52">Adolescent (16-52 weeks)</SelectItem>
              <SelectItem value="52-104">Adult (1-2 years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gender */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Gender</Label>
          <Select
            value={filters.gender}
            onValueChange={(value: 'male' | 'female' | 'any') =>
              setFilters(prev => ({ ...prev, gender: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Genders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Color */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Color</Label>
          <Select
            value={filters.color || 'all'}
            onValueChange={(value) =>
              setFilters(prev => ({ ...prev, color: value === 'all' ? null : value }))
            }
            disabled={!filters.breedId}
          >
            <SelectTrigger>
              <SelectValue placeholder={filters.breedId ? "All Colors" : "Select breed first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colors</SelectItem>
              {colors?.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Coat Length */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Coat Length</Label>
          <Select
            value={filters.coatLength || 'all'}
            onValueChange={(value) =>
              setFilters(prev => ({ ...prev, coatLength: value === 'all' ? null : value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Coat Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Coat Types</SelectItem>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="curly">Curly</SelectItem>
              <SelectItem value="wire">Wire</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Price Range: ${filters.price[0]} - ${filters.price[1] === 10000 ? '10000+' : filters.price[1]}
        </Label>
        <Slider
          value={filters.price}
          onValueChange={handlePriceChange}
          min={0}
          max={10000}
          step={100}
          className="w-full max-w-md"
        />
      </div>

      {/* Age Range, Location, Distance in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Min Age (weeks)</Label>
          <Input
            type="number"
            min="0"
            max="104"
            value={filters.age.minWeeks}
            onChange={(e) =>
              setFilters(prev => ({
                ...prev,
                age: { ...prev.age, minWeeks: Math.max(0, parseInt(e.target.value) || 0) }
              }))
            }
            placeholder="0"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Max Age (weeks)</Label>
          <Input
            type="number"
            min="0"
            max="104"
            value={filters.age.maxWeeks}
            onChange={(e) =>
              setFilters(prev => ({
                ...prev,
                age: { ...prev.age, maxWeeks: Math.min(104, parseInt(e.target.value) || 104) }
              }))
            }
            placeholder="104"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Location</Label>
          <Input
            type="text"
            value={filters.location.city}
            onChange={(e) =>
              setFilters(prev => ({
                ...prev,
                location: { ...prev.location, city: e.target.value }
              }))
            }
            placeholder="City, State"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Distance</Label>
          <Select
            value={filters.location.radiusKm.toString()}
            onValueChange={(value) =>
              setFilters(prev => ({
                ...prev,
                location: { ...prev.location, radiusKm: parseInt(value) }
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="999">Any distance</SelectItem>
              <SelectItem value="25">Within 25 km</SelectItem>
              <SelectItem value="50">Within 50 km</SelectItem>
              <SelectItem value="100">Within 100 km</SelectItem>
              <SelectItem value="250">Within 250 km</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Training Level</Label>
          <Select
            value={filters.training || 'all'}
            onValueChange={(value) =>
              setFilters(prev => ({ ...prev, training: value === 'all' ? null : value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Level</SelectItem>
              <SelectItem value="none">No Training</SelectItem>
              <SelectItem value="basic">Basic Training</SelectItem>
              <SelectItem value="advanced">Advanced Training</SelectItem>
              <SelectItem value="service">Service Training</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Energy Level</Label>
          <Select
            value={filters.energy || 'all'}
            onValueChange={(value) =>
              setFilters(prev => ({ ...prev, energy: value === 'all' ? null : value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Level</SelectItem>
              <SelectItem value="low">Low Energy</SelectItem>
              <SelectItem value="moderate">Moderate Energy</SelectItem>
              <SelectItem value="high">High Energy</SelectItem>
              <SelectItem value="very-high">Very High Energy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Paperwork</Label>
          <Select
            value={filters.paperwork || 'all'}
            onValueChange={(value) =>
              setFilters(prev => ({ ...prev, paperwork: value === 'all' ? null : value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="akc">AKC Registered</SelectItem>
              <SelectItem value="ckc">CKC Registered</SelectItem>
              <SelectItem value="papers">Registration Papers</SelectItem>
              <SelectItem value="none">No Papers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Toggle Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={filters.toggles.verified}
            onCheckedChange={(checked) => handleToggleChange('verified', !!checked)}
          />
          <Label htmlFor="verified" className="text-sm font-medium text-gray-700">
            Verified only
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="availableNow"
            checked={filters.toggles.availableNow}
            onCheckedChange={(checked) => handleToggleChange('availableNow', !!checked)}
          />
          <Label htmlFor="availableNow" className="text-sm font-medium text-gray-700">
            Available now
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="healthChecked"
            checked={filters.toggles.healthChecked}
            onCheckedChange={(checked) => handleToggleChange('healthChecked', !!checked)}
          />
          <Label htmlFor="healthChecked" className="text-sm font-medium text-gray-700">
            Health checked
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="vaccinated"
            checked={filters.toggles.vaccinated}
            onCheckedChange={(checked) => handleToggleChange('vaccinated', !!checked)}
          />
          <Label htmlFor="vaccinated" className="text-sm font-medium text-gray-700">
            Vaccinated
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="spayedNeutered"
            checked={filters.toggles.spayedNeutered}
            onCheckedChange={(checked) => handleToggleChange('spayedNeutered', !!checked)}
          />
          <Label htmlFor="spayedNeutered" className="text-sm font-medium text-gray-700">
            Spayed/Neutered
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="goodWithKids"
            checked={filters.toggles.goodWithKids}
            onCheckedChange={(checked) => handleToggleChange('goodWithKids', !!checked)}
          />
          <Label htmlFor="goodWithKids" className="text-sm font-medium text-gray-700">
            Good with kids
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="goodWithPets"
            checked={filters.toggles.goodWithPets}
            onCheckedChange={(checked) => handleToggleChange('goodWithPets', !!checked)}
          />
          <Label htmlFor="goodWithPets" className="text-sm font-medium text-gray-700">
            Good with pets
          </Label>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}