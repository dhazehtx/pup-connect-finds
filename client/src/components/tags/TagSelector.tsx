import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X, Tag, Search } from 'lucide-react';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  popularTags?: string[];
  className?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  maxTags = 3,
  placeholder = "Add tags to improve discoverability...",
  popularTags = [],
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default popular tags for the pet platform
  const defaultPopularTags = [
    'puppytraining',
    'goldenretriever',
    'rescuedogs',
    'doghealth',
    'puppylove',
    'dogbreeding',
    'petcare',
    'dogtraining',
    'puppylife',
    'rescuedog',
    'goldendoodle',
    'labrador',
    'germanshepherd',
    'bulldog',
    'beagle',
    'poodle',
    'husky',
    'chihuahua',
    'bordercollie',
    'yorkshire',
    'healthydog',
    'dogtips',
    'puppycare',
    'dognutrition',
    'dogexercise',
    'puppysocialization',
    'dogbehavior',
    'petadoption',
    'dogrescue',
    'responsiblebreeding'
  ];

  const allPopularTags = [...popularTags, ...defaultPopularTags];

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allPopularTags.filter(tag =>
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.includes(tag)
      );
      setFilteredSuggestions(filtered.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, selectedTags, allPopularTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove # if user types it
    const cleanValue = value.replace(/^#+/, '');
    setInputValue(cleanValue);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue.trim());
    }
  };

  const addTag = (tag: string) => {
    if (!tag || selectedTags.length >= maxTags || selectedTags.includes(tag)) {
      return;
    }

    // Clean the tag (remove special characters, spaces, etc.)
    const cleanTag = tag.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (cleanTag && !selectedTags.includes(cleanTag)) {
      onTagsChange([...selectedTags, cleanTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const selectSuggestion = (tag: string) => {
    addTag(tag);
    inputRef.current?.focus();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="pr-1">
              #{tag}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Input */}
      <div className="relative">
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyPress}
            onFocus={() => inputValue && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={selectedTags.length >= maxTags ? `Maximum ${maxTags} tags` : placeholder}
            className="pl-10"
            disabled={selectedTags.length >= maxTags}
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto">
            <CardContent className="p-2">
              <div className="space-y-1">
                {filteredSuggestions.map((tag) => (
                  <Button
                    key={tag}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-8"
                    onClick={() => selectSuggestion(tag)}
                  >
                    <Tag className="mr-2 h-3 w-3" />
                    #{tag}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Popular Tags */}
      {selectedTags.length < maxTags && !inputValue && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Popular tags:</p>
          <div className="flex flex-wrap gap-1">
            {allPopularTags
              .filter(tag => !selectedTags.includes(tag))
              .slice(0, 12)
              .map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => addTag(tag)}
                >
                  #{tag}
                </Button>
              ))}
          </div>
        </div>
      )}

      {/* Tag Counter */}
      <p className="text-xs text-muted-foreground">
        {selectedTags.length}/{maxTags} tags selected
        {selectedTags.length > 0 && ' • Tags help others discover your content'}
      </p>
    </div>
  );
};

export default TagSelector;