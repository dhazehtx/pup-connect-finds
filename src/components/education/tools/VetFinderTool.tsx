
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Phone, FileText } from 'lucide-react';

export const VetFinderTool: React.FC = () => {
  const [zipCode, setZipCode] = useState('');

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input 
          placeholder="Enter ZIP code" 
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className="flex-1" 
        />
        <Button 
          onClick={() => window.open(`https://www.google.com/search?q=veterinarian+near+${zipCode}`, '_blank')}
          disabled={!zipCode}
        >
          Find Vets
        </Button>
      </div>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => window.open('https://www.akc.org/expert-advice/vets-corner/emergency-vet-care/', '_blank')}
        >
          <Phone size={16} className="mr-2" />
          Emergency Vet Guide
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => window.open('https://www.akc.org/expert-advice/vets-corner/choosing-a-veterinarian/', '_blank')}
        >
          <FileText size={16} className="mr-2" />
          How to Choose a Vet
        </Button>
      </div>
    </div>
  );
};
