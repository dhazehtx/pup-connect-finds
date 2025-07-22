
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator } from 'lucide-react';

export const FeedingCalculatorTool: React.FC = () => {
  const [dogAge, setDogAge] = useState('');
  const [dogWeight, setDogWeight] = useState('');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Input 
          placeholder="Dog's age (months)" 
          value={dogAge}
          onChange={(e) => setDogAge(e.target.value)}
          type="number"
        />
        <Input 
          placeholder="Weight (lbs)" 
          value={dogWeight}
          onChange={(e) => setDogWeight(e.target.value)}
          type="number"
        />
      </div>
      <Button 
        className="w-full"
        onClick={() => window.open('https://www.akc.org/expert-advice/nutrition/dog-feeding-guide/', '_blank')}
      >
        <Calculator size={16} className="mr-2" />
        Get Feeding Guidelines
      </Button>
      <div className="grid grid-cols-1 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/expert-advice/nutrition/puppy-feeding-fundamentals/', '_blank')}
        >
          Puppy Feeding Guide
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/expert-advice/home-living/', '_blank')}
        >
          Home Living Guide
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/expert-advice/lifestyle/', '_blank')}
        >
          Lifestyle Guide
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/expert-advice/nutrition/nutrition-and-supplements-for-senior-dogs/', '_blank')}
        >
          Senior Dog Nutrition
        </Button>
      </div>
    </div>
  );
};
