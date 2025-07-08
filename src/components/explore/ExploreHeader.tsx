
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
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      {/* Main search bar */}
      <div className="relative flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by breed, breeder name, or keywords..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 bg-white text-gray-900 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
          />
        </div>
        
        {/* Post Button - only show for logged-in users */}
        {showPostButton && (
          <Button 
            onClick={handleCreatePost}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Post</span>
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-600 whitespace-nowrap"
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
