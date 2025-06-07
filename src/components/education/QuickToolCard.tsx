
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Calculator, Calendar, Heart } from 'lucide-react';
import { VetFinderTool } from './tools/VetFinderTool';
import { HealthCheckerTool } from './tools/HealthCheckerTool';
import { FeedingCalculatorTool } from './tools/FeedingCalculatorTool';
import { TrainingPlannerTool } from './tools/TrainingPlannerTool';
import { BreedSelectorTool } from './tools/BreedSelectorTool';

interface QuickTool {
  id: string;
  title: string;
  description: string;
  color: string;
  type: string;
}

interface QuickToolCardProps {
  tool: QuickTool;
}

export const QuickToolCard: React.FC<QuickToolCardProps> = ({ tool }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'vet-finder': return <Search size={20} />;
      case 'health-checker': return <Heart size={20} />;
      case 'feeding-calculator': return <Calculator size={20} />;
      case 'training-planner': return <Calendar size={20} />;
      case 'breed-selector': return <Search size={20} />;
      default: return <Search size={20} />;
    }
  };

  const getToolContent = (type: string) => {
    switch (type) {
      case 'vet-finder': return <VetFinderTool />;
      case 'health-checker': return <HealthCheckerTool />;
      case 'feeding-calculator': return <FeedingCalculatorTool />;
      case 'training-planner': return <TrainingPlannerTool />;
      case 'breed-selector': return <BreedSelectorTool />;
      default: return null;
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${tool.color}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          {getIcon(tool.type)}
          <div>
            <h3 className="text-base">{tool.title}</h3>
            <p className="text-sm font-normal text-gray-600 mt-1">
              {tool.description}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {getToolContent(tool.type)}
      </CardContent>
    </Card>
  );
};
