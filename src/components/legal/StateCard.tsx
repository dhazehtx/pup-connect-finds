
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StateCardProps {
  state: {
    name: string;
    category: 'strict' | 'moderate' | 'lenient';
    licensing: string;
    healthCertificates: string;
    restrictions: string[];
    penalties: string;
    legislativeAct?: string;
  };
}

const StateCard = ({ state }: StateCardProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strict': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'lenient': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'strict': return 'Strict Regulations';
      case 'moderate': return 'Moderate Regulations';
      case 'lenient': return 'Lenient Regulations';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{state.name}</CardTitle>
          <Badge className={getCategoryColor(state.category)}>
            {getCategoryLabel(state.category)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-1">Licensing Requirements</h4>
          <p className="text-sm text-muted-foreground">{state.licensing}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-1">Health Certificates</h4>
          <p className="text-sm text-muted-foreground">{state.healthCertificates}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-1">Key Restrictions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {state.restrictions.map((restriction, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {restriction}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-1">Penalties</h4>
          <p className="text-sm text-muted-foreground">{state.penalties}</p>
        </div>
        
        {state.legislativeAct && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Legislative Act</h4>
            <p className="text-sm text-muted-foreground">{state.legislativeAct}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StateCard;
