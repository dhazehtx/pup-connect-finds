import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Tag } from 'lucide-react';

interface ProductTagsProps {
  selectedTag?: string;
  onTagSelect: (tag: string | null) => void;
  className?: string;
}

const ProductTags: React.FC<ProductTagsProps> = ({ selectedTag, onTagSelect, className = '' }) => {
  const [customTag, setCustomTag] = useState('');

  // Get all products to extract unique tags
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data.data || [];
    },
  });

  // Extract unique tags from all products
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    products.forEach((product: any) => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag: string) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [products]);

  const handleCustomTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTag.trim()) {
      onTagSelect(customTag.trim());
      setCustomTag('');
    }
  };

  const clearSelection = () => {
    onTagSelect(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Filter by Tags
        </h3>
        {selectedTag && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearSelection}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Popular Tags */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Popular Tags:</p>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 12).map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedTag === tag 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                }`}
                onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Custom Tag Input */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Search custom tag:</p>
        <form onSubmit={handleCustomTagSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter tag name..."
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={!customTag.trim()}>
            Search
          </Button>
        </form>
      </div>

      {/* Current Selection */}
      {selectedTag && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Filtering by:</strong> {selectedTag}
          </p>
        </div>
      )}

      {/* Tag Statistics */}
      {allTags.length > 0 && (
        <div className="text-xs text-gray-500 pt-2 border-t">
          {allTags.length} unique tags available
        </div>
      )}
    </div>
  );
};

export default ProductTags;