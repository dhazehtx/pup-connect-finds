import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tag, X, Filter, TrendingUp } from 'lucide-react';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onClearFilters: () => void;
  popularTags?: string[];
  trendingTags?: string[];
  className?: string;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  selectedTags,
  onTagsChange,
  onClearFilters,
  popularTags = [],
  trendingTags = [],
  className = ''
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'popular' | 'trending'>('all');

  // Default tags for the pet platform
  const defaultPopularTags = [
    'puppytraining', 'goldenretriever', 'rescuedogs', 'doghealth',
    'puppylove', 'dogbreeding', 'petcare', 'dogtraining',
    'puppylife', 'rescuedog', 'goldendoodle', 'labrador'
  ];

  const defaultTrendingTags = [
    'puppysocialization', 'dognutrition', 'responsiblebreeding',
    'petadoption', 'dogrescue', 'healthydog', 'dogtips'
  ];

  const allPopularTags = [...popularTags, ...defaultPopularTags];
  const allTrendingTags = [...trendingTags, ...defaultTrendingTags];

  const getDisplayTags = () => {
    let baseTags: string[] = [];
    
    switch (filterType) {
      case 'popular':
        baseTags = allPopularTags;
        break;
      case 'trending':
        baseTags = allTrendingTags;
        break;
      default:
        baseTags = [...new Set([...allPopularTags, ...allTrendingTags])];
    }

    if (searchValue.trim()) {
      return baseTags.filter(tag =>
        tag.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    return baseTags.slice(0, 20);
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    // If user types a tag that doesn't exist in suggestions, allow manual addition
    if (value.trim() && !getDisplayTags().includes(value.toLowerCase())) {
      // Could add custom tag functionality here
    }
  };

  const displayTags = getDisplayTags();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium text-sm">Filter by Tags</span>
        </div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="default" className="pr-1">
              #{tag}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleTagClick(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search and Filter Type */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tags..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(value: 'all' | 'popular' | 'trending') => setFilterType(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tag Cloud */}
      <Card>
        <CardContent className="p-4">
          {displayTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {displayTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const isTrending = allTrendingTags.includes(tag);
                
                return (
                  <Button
                    key={tag}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagClick(tag)}
                    className={`h-8 ${isSelected ? '' : 'hover:bg-primary/10'}`}
                  >
                    {isTrending && (
                      <TrendingUp className="mr-1 h-3 w-3 text-orange-500" />
                    )}
                    #{tag}
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Tag className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No tags found matching "{searchValue}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="text-xs text-muted-foreground text-center">
        {selectedTags.length > 0 && (
          <span>Filtering by {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} • </span>
        )}
        {displayTags.length} tags available
        {filterType === 'trending' && ' • Updated hourly'}
      </div>
    </div>
  );
};

export default TagFilter;