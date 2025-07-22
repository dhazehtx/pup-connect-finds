
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, List } from 'lucide-react';

interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleList: () => void;
}

const MapControls = ({ zoom, onZoomIn, onZoomOut, onToggleList }: MapControlsProps) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onZoomIn}
        className="w-10 h-10 p-0 bg-white"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onZoomOut}
        className="w-10 h-10 p-0 bg-white"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleList}
        className="w-10 h-10 p-0 bg-white"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default MapControls;
