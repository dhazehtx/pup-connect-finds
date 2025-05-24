
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ExploreFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedBreed: string;
  setSelectedBreed: (value: string) => void;
  selectedColor: string;
  setSelectedColor: (value: string) => void;
  selectedGender: string;
  setSelectedGender: (value: string) => void;
  selectedAge: string;
  setSelectedAge: (value: string) => void;
  selectedGenetics: string[];
  setSelectedGenetics: (value: string[]) => void;
  priceRange: { min: string; max: string };
  setPriceRange: (value: { min: string; max: string }) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
}

const ExploreFilters = ({
  searchTerm,
  setSearchTerm,
  selectedBreed,
  setSelectedBreed,
  selectedColor,
  setSelectedColor,
  selectedGender,
  setSelectedGender,
  selectedAge,
  setSelectedAge,
  selectedGenetics,
  setSelectedGenetics,
  priceRange,
  setPriceRange,
  showFilters,
  setShowFilters
}: ExploreFiltersProps) => {
  const breeds = [
    'French Bulldog', 'Golden Retriever', 'German Shepherd', 'Labrador', 
    'Poodle', 'Bulldog', 'Beagle', 'Rottweiler', 'Siberian Husky', 'Dachshund'
  ];

  const colors = [
    'Black', 'White', 'Brown', 'Golden', 'Cream', 'Blue', 'Fawn', 'Brindle', 'Merle', 'Chocolate'
  ];

  const ages = [
    '8-12 weeks', '3-6 months', '6-12 months', '1-2 years', '2+ years'
  ];

  const frenchBulldogGenetics = [
    'BB (Non-dilute)', 'Bb (Carrier dilute)', 'bb (Dilute blue)', 
    'DD (Non-dilute)', 'Dd (Carrier dilute)', 'dd (Dilute)',
    'COCO (Cream/White)', 'COco (Cream carrier)', 'coco (Normal)',
    'AtAt (Tan points)', 'Ata (Tan carrier)', 'aa (Recessive black)',
    'EmEm (Dark mask)', 'Eme (Mask carrier)', 'ee (Red/Yellow)',
    'NN (Normal)', 'Nn (Carrier)', 'nn (Recessive trait)'
  ];

  const handleGeneticsChange = (genetic: string, checked: boolean) => {
    if (checked) {
      setSelectedGenetics([...selectedGenetics, genetic]);
    } else {
      setSelectedGenetics(selectedGenetics.filter(g => g !== genetic));
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4 mb-6 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search for puppies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter size={18} />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
              <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                <SelectTrigger>
                  <SelectValue placeholder="All breeds" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {breeds.map((breed) => (
                    <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="All colors" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger>
                  <SelectValue placeholder="All genders" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <Select value={selectedAge} onValueChange={setSelectedAge}>
                <SelectTrigger>
                  <SelectValue placeholder="All ages" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {ages.map((age) => (
                    <SelectItem key={age} value={age}>{age}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                />
                <Input
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                />
              </div>
            </div>
          </div>

          {selectedBreed === 'French Bulldog' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Genetics</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {frenchBulldogGenetics.map((genetic) => (
                  <div key={genetic} className="flex items-center space-x-2">
                    <Checkbox
                      id={genetic}
                      checked={selectedGenetics.includes(genetic)}
                      onCheckedChange={(checked) => handleGeneticsChange(genetic, checked as boolean)}
                    />
                    <label htmlFor={genetic} className="text-sm text-gray-700 cursor-pointer">
                      {genetic}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExploreFilters;
