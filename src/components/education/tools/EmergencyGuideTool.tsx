
import React from 'react';
import { Button } from '@/components/ui/button';

export const EmergencyGuideTool: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <h4 className="font-medium text-red-800 mb-2">Emergency Numbers</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>ASPCA Poison Control:</span>
            <span className="font-mono">(888) 426-4435</span>
          </div>
          <div className="flex justify-between">
            <span>Pet Poison Helpline:</span>
            <span className="font-mono">(855) 764-7661</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/expert-advice/health/dog-dental-care/', '_blank')}
        >
          First Aid Guide
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.akc.org/expert-advice/vets-corner/emergency-vet-care/', '_blank')}
        >
          When to Seek Emergency Care
        </Button>
      </div>
    </div>
  );
};
