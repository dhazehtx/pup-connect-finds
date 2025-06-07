
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag } from 'lucide-react';

const FederalSection = () => {
  return (
    <Card className="mb-8 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Flag size={20} />
          Federal USDA Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2 text-blue-800">Commercial Breeding Operations</h4>
          <p className="text-sm text-blue-700 mb-2">
            Any person who maintains breeding female dogs and sells puppies at wholesale for resale, 
            or sells directly to the public if they maintain more than 4 breeding females, must be licensed by USDA.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-2 text-blue-800">USDA Licensing Requirements</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-start">
              <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              Application and annual licensing fees
            </li>
            <li className="flex items-start">
              <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              Facility inspections by USDA officials
            </li>
            <li className="flex items-start">
              <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              Compliance with Animal Welfare Act standards
            </li>
            <li className="flex items-start">
              <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              Detailed record keeping requirements
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-2 text-blue-800">Animal Welfare Act Standards</h4>
          <p className="text-sm text-blue-700">
            Minimum standards for housing, feeding, watering, sanitation, ventilation, shelter from extremes, 
            adequate veterinary care, and transportation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FederalSection;
