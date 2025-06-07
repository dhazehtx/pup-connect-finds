
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export const BreedSelectorTool: React.FC = () => {
  return (
    <div className="space-y-3">
      <Button 
        className="w-full"
        onClick={() => window.open('https://www.akc.org/dog-breed-selector/', '_blank')}
      >
        <Search size={16} className="mr-2" />
        Start Breed Quiz
      </Button>
      <div className="grid grid-cols-1 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/dog-breeds/', '_blank')}
        >
          Browse All Breeds
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/breed-selector-tool/', '_blank')}
        >
          Breed Selection Guide
        </Button>
      </div>
    </div>
  );
};
