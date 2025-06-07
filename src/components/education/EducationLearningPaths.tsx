
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { LearningPathCard } from './LearningPathCard';
import { learningPathsData } from '../../data/learningPathsData';

export const EducationLearningPaths: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Structured Learning Paths</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Follow our expertly designed learning paths based on American Kennel Club expertise. 
          Each path provides step-by-step guidance with reliable, veterinarian-approved content.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {learningPathsData.map((path) => (
          <LearningPathCard key={path.id} path={path} />
        ))}
      </div>
      
      <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Need More Specialized Training?</h3>
        <p className="text-blue-700 text-sm mb-4">
          Explore additional specialized courses and certifications
        </p>
        <Button 
          variant="outline"
          onClick={() => window.open('https://www.akc.org/expert-advice/training/', '_blank')}
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <ExternalLink size={16} className="mr-2" />
          Browse All Training Resources
        </Button>
      </div>
    </div>
  );
};
