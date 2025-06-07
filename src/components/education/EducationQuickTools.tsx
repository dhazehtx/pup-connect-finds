
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const EducationQuickTools: React.FC = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🏥 Vet Finder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Find trusted veterinarians in your area</p>
          <div className="flex gap-2">
            <Input placeholder="ZIP code" className="flex-1" />
            <Button onClick={() => window.open('https://www.akc.org/vet-finder/', '_blank')}>
              Find
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Health Checker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Quick health assessment tool</p>
          <Button 
            className="w-full"
            onClick={() => window.open('https://www.akc.org/expert-advice/health/', '_blank')}
          >
            Start Assessment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📅 Care Planner</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Create a personalized care schedule</p>
          <Button 
            className="w-full"
            onClick={() => window.open('https://www.akc.org/expert-advice/puppy-information/', '_blank')}
          >
            Create Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
