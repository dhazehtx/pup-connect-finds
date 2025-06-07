
import React from 'react';
import { Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EducationLegalGuideProps {
  onRegulationClick: (category: string) => void;
}

export const EducationLegalGuide: React.FC<EducationLegalGuideProps> = ({ onRegulationClick }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-green-500" />
          State-by-State Legal Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">Understand dog sale and adoption laws in your state</p>
        <div className="grid md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="justify-start bg-red-50 border-red-200 text-red-800 hover:bg-red-100"
            onClick={() => onRegulationClick('strict')}
          >
            Strict Regulations
          </Button>
          <Button 
            variant="outline" 
            className="justify-start bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
            onClick={() => onRegulationClick('moderate')}
          >
            Moderate Regulations
          </Button>
          <Button 
            variant="outline" 
            className="justify-start bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
            onClick={() => onRegulationClick('lenient')}
          >
            Lenient Regulations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
