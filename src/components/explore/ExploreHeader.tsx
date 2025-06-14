
import React from 'react';
import { Search, Filter, Heart } from 'lucide-react';
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
    <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">MY PUP</span>
      </div>
      
      {/* Main search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by breed, breeder name, or keywords..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-20 bg-background text-foreground border-border"
        />
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background text-foreground border-border hover:bg-muted"
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
