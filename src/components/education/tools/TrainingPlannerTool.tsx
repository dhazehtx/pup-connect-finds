
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export const TrainingPlannerTool: React.FC = () => {
  return (
    <div className="space-y-3">
      <Button 
        className="w-full"
        onClick={() => window.open('https://www.akc.org/expert-advice/training/puppy-training-basics/', '_blank')}
      >
        <Calendar size={16} className="mr-2" />
        Create Training Plan
      </Button>
      <div className="grid grid-cols-1 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/expert-advice/training/basic-dog-training-commands/', '_blank')}
        >
          Basic Commands Guide
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/expert-advice/training/how-to-potty-train-a-puppy/', '_blank')}
        >
          House Training Schedule
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/expert-advice/puppy-information/puppy-socialization/', '_blank')}
        >
          Socialization Checklist
        </Button>
      </div>
    </div>
  );
};
