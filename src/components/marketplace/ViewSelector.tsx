
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, List, Search } from 'lucide-react';

interface ViewSelectorProps {
  activeView: 'list' | 'map' | 'compare';
  onViewChange: (view: 'list' | 'map' | 'compare') => void;
  listingsCount: number;
  comparisonCount: number;
}

const ViewSelector = ({ 
  activeView, 
  onViewChange, 
  listingsCount, 
  comparisonCount 
}: ViewSelectorProps) => {
  return (
    <div className="flex items-center justify-between">
      <Tabs value={activeView} onValueChange={(value: any) => onViewChange(value)}>
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Compare ({comparisonCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {listingsCount} listings found
        </Badge>
        {comparisonCount > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewChange('compare')}
          >
            Compare ({comparisonCount})
          </Button>
        )}
      </div>
    </div>
  );
};

export default ViewSelector;
