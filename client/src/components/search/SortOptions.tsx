
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Clock, Star } from 'lucide-react';

interface SortOptionsProps {
  sortBy: 'distance' | 'price' | 'date' | 'popularity';
  sortOrder: 'asc' | 'desc';
  onSortByChange: (sortBy: 'distance' | 'price' | 'date' | 'popularity') => void;
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

const SortOptions = ({ sortBy, sortOrder, onSortByChange, onSortOrderChange }: SortOptionsProps) => {
  const sortOptions = [
    { value: 'distance' as const, label: 'Distance', icon: MapPin },
    { value: 'price' as const, label: 'Price', icon: DollarSign },
    { value: 'date' as const, label: 'Date Listed', icon: Clock },
    { value: 'popularity' as const, label: 'Popularity', icon: Star }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Sort by:</span>
          <div className="flex gap-2">
            {sortOptions.map(option => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSortByChange(option.value)}
                  className="flex items-center gap-1"
                >
                  <Icon className="w-3 h-3" />
                  {option.label}
                  {sortBy === option.value && (
                    <span 
                      className="ml-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SortOptions;
