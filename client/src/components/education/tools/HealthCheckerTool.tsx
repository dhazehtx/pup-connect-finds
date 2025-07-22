
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export const HealthCheckerTool: React.FC = () => {
  return (
    <div className="space-y-3">
      <Button 
        className="w-full"
        onClick={() => window.open('https://www.akc.org/expert-advice/health/symptoms-to-watch-for-in-your-dog/', '_blank')}
      >
        <ExternalLink size={16} className="mr-2" />
        Symptom Checker Guide
      </Button>
      <div className="grid grid-cols-1 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/expert-advice/health/puppy-shots-complete-guide/', '_blank')}
        >
          Vaccination Schedule
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/expert-advice/health/deworming-dogs-what-you-need-to-know/', '_blank')}
        >
          Parasite Prevention
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/expert-advice/health/flea-tick/', '_blank')}
        >
          Flea & Tick Information
        </Button>
      </div>
    </div>
  );
};
