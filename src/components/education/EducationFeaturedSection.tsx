
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const EducationFeaturedSection: React.FC = () => {
  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">New Owner Starter Pack</h2>
            <p className="text-gray-600 mb-4">Complete guide for first-time dog owners with downloadable checklists</p>
            <Button 
              onClick={() => window.open('https://www.akc.org/expert-advice/home-living/puppy-proofing-your-home/', '_blank')}
            >
              Get Started
            </Button>
          </div>
          <div className="hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=150&fit=crop"
              alt="Puppy care"
              className="rounded-lg"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
