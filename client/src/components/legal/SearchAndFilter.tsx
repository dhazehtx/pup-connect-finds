
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const SearchAndFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory 
}: SearchAndFilterProps) => {
  return (
    <div className="mb-8 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search states..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          size="sm"
        >
          All States
        </Button>
        <Button
          variant={selectedCategory === 'strict' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('strict')}
          size="sm"
        >
          Strict Regulations
        </Button>
        <Button
          variant={selectedCategory === 'moderate' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('moderate')}
          size="sm"
        >
          Moderate Regulations
        </Button>
        <Button
          variant={selectedCategory === 'lenient' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('lenient')}
          size="sm"
        >
          Lenient Regulations
        </Button>
      </div>
    </div>
  );
};

export default SearchAndFilter;
