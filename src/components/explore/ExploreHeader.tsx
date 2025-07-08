
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

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Trigger search immediately on Enter key
      onSearchChange(searchTerm);
    }
  };

  return (
    <div className="bg-white px-4 py-4">
      {/* Facebook Marketplace Style Header Layout */}
      <div className="relative flex items-center gap-3 max-w-7xl mx-auto">
        {/* Search input - ~60% width, Facebook Marketplace style */}
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by breed, breeder name, location, or keywords..."
            value={searchTerm}
            onChange={handleSearchInput}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-4 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500 h-11 rounded-full text-gray-900 placeholder-gray-500"
          />
        </div>
        
        {/* Right side buttons - Facebook Marketplace style */}
        <div className="flex items-center gap-2">
          {/* Post Button - Primary action */}
          {showPostButton && (
            <Button 
              onClick={handleCreatePost}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-11 rounded-full font-medium flex items-center gap-2 whitespace-nowrap shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Post</span>
            </Button>
          )}
          
          {/* Filters Button - Secondary action */}
          <Button 
            variant="outline" 
            size="sm" 
            className={`bg-white text-gray-700 border-gray-300 hover:bg-gray-50 h-11 px-4 whitespace-nowrap transition-all duration-200 rounded-full ${
              showAdvancedFilters 
                ? 'border-blue-500 text-blue-600 bg-blue-50 shadow-sm' 
                : 'hover:border-gray-400 shadow-sm'
            }`}
            onClick={onToggleFilters}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showAdvancedFilters && (
              <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExploreHeader;
