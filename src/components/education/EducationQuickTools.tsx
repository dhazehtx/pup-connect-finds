
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { QuickToolCard } from './QuickToolCard';
import { quickToolsData } from '../../data/quickToolsData';

export const EducationQuickTools: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Tools & Resources</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Access essential tools and calculators for dog care, all powered by American Kennel Club expertise and trusted veterinary sources.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickToolsData.map((tool) => (
          <QuickToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <h3 className="font-semibold text-blue-900 mb-2">Need More Resources?</h3>
          <p className="text-blue-700 text-sm mb-4">
            Access the complete American Kennel Club expert advice library with hundreds of articles, guides, and tools.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              variant="outline"
              onClick={() => window.open('https://www.akc.org/expert-advice/', '_blank')}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <ExternalLink size={16} className="mr-2" />
              Browse All Expert Advice
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://www.akc.org/products-services/', '_blank')}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <ExternalLink size={16} className="mr-2" />
              AKC Services & Programs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
