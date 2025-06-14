
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ExploreHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showAdvancedFilters: boolean;
  onToggleFilters: () => void;
}

const ExploreHeader = ({ 
  searchTerm, 
  onSearchChange, 
  showAdvancedFilters, 
  onToggleFilters 
}: ExploreHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      {/* Main search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by breed, breeder name, or keywords..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-20 bg-white text-gray-900 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
        />
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-600"
          onClick={onToggleFilters}
        >
          <Filter className="w-4 h-4 mr-1" />
          Filters
        </Button>
      </div>
    </div>
  );
};

export default ExploreHeader;
