
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SavedSearchesProps {
  savedSearches: any[];
  onLoadSearch: (search: any) => void;
}

const SavedSearches = ({ savedSearches, onLoadSearch }: SavedSearchesProps) => {
  if (savedSearches.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Saved Searches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {savedSearches.map((search, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => onLoadSearch(search)}
            >
              {search.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedSearches;
