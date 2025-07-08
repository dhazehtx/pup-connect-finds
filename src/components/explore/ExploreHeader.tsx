
import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  // Show button for logged-in users or guests
  const showPostButton = user || isGuest;

  const handleCreatePost = () => {
    navigate('/post');
  };

  return (
    <div className="bg-white px-4 py-4">
      {/* Enhanced search bar with better proportions */}
      <div className="relative flex items-center gap-3 max-w-7xl mx-auto">
        {/* Search input - takes up ~60% of available space */}
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by breed, breeder name, or keywords..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 bg-white text-gray-900 border-gray-300 focus:border-blue-600 focus:ring-blue-600 h-10"
          />
        </div>
        
        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          {/* Post Button - only show for logged-in users */}
          {showPostButton && (
            <Button 
              onClick={handleCreatePost}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-10 rounded-full font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Post</span>
            </Button>
          )}
          
          {/* Filters Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className={`bg-white text-gray-700 border-gray-300 hover:bg-gray-50 h-10 px-4 whitespace-nowrap transition-colors ${
              showAdvancedFilters ? 'border-blue-600 text-blue-600 bg-blue-50' : 'hover:border-blue-600'
            }`}
            onClick={onToggleFilters}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExploreHeader;
