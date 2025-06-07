
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const EducationLearningPaths: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🐶 First-Time Owner Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Complete journey from preparation to advanced care</p>
          <div className="space-y-2 mb-4">
            <div className="text-sm text-gray-600">• <a href="https://www.akc.org/expert-advice/home-living/puppy-proofing-your-home/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Puppy-Proofing Your Home</a></div>
            <div className="text-sm text-gray-600">• <a href="https://www.akc.org/expert-advice/training/puppy-training-basics/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Puppy Training Basics</a></div>
            <div className="text-sm text-gray-600">• <a href="https://www.akc.org/expert-advice/health/how-to-choose-a-veterinarian/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Finding the Right Veterinarian</a></div>
            <div className="text-sm text-gray-600">• <a href="https://www.akc.org/expert-advice/health/puppy-shots-complete-guide/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AKC Vaccination Schedule Guide</a></div>
          </div>
          <Button 
            className="w-full"
            onClick={() => window.open('https://www.akc.org/expert-advice/home-living/puppy-proofing-your-home/', '_blank')}
          >
            Start Learning Path
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🥗 Nutrition Expert Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Master dog nutrition from puppyhood to senior years</p>
          <div className="space-y-2 mb-4">
            <div className="text-sm text-gray-600">• <a href="https://www.akc.org/expert-advice/nutrition/puppy-feeding-guide/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Puppy Nutrition Fundamentals</a></div>
            <div className="text-sm text-gray-600">• <a href="https://www.akc.org/expert-advice/nutrition/dog-feeding-guide/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Adult Dog Diet Planning</a></div>
            <div className="text-sm text-gray-600">• <a href="https://www.akc.org/expert-advice/nutrition/senior-dog-nutrition/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Senior Dog Nutrition</a></div>
            <div className="text-sm text-gray-600">• <a href="https://www.akc.org/expert-advice/nutrition/healthy-dog-treats/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Healthy Treats and Special Diets</a></div>
          </div>
          <Button 
            className="w-full"
            onClick={() => window.open('https://www.akc.org/expert-advice/nutrition/', '_blank')}
          >
            Start Learning Path
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
