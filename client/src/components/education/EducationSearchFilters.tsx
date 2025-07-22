
import React from 'react';
import { Search, Bookmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EducationSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  showBookmarksOnly: boolean;
  setShowBookmarksOnly: (show: boolean) => void;
  bookmarkedCount: number;
  categories: Array<{ id: string; name: string; icon: string; }>;
}

export const EducationSearchFilters: React.FC<EducationSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  showBookmarksOnly,
  setShowBookmarksOnly,
  bookmarkedCount
}) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Search resources, tags, authors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Button
          variant={showBookmarksOnly ? "default" : "outline"}
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className="flex items-center gap-2"
        >
          <Bookmark size={16} />
          Bookmarked ({bookmarkedCount})
        </Button>
      </div>
    </div>
  );
};
