
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { ArticleCard } from './ArticleCard';

interface Article {
  title: string;
  description: string;
  url: string;
  readTime: string;
  rating: number;
  difficulty: string;
}

interface Section {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  articles: Article[];
}

interface SectionCardProps {
  section: Section;
}

export const SectionCard: React.FC<SectionCardProps> = ({ section }) => {
  const getSectionUrl = (sectionId: string) => {
    const urlMapping: { [key: string]: string } = {
      'veterinary': 'vets-corner',
      'puppy': 'puppy-information',
      'nutrition': 'nutrition',
      'training': 'training',
      'health': 'health'
    };
    return urlMapping[sectionId] || sectionId;
  };

  return (
    <Card className={`${section.color}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <span className="text-2xl">{section.icon}</span>
          <div>
            <h3>{section.title}</h3>
            <p className="text-sm font-normal text-gray-600 mt-1">
              {section.description}
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {section.articles.length} articles
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
          {section.articles.map((article, index) => (
            <ArticleCard key={index} article={article} />
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            className="group"
            onClick={() => window.open(`https://www.akc.org/expert-advice/${getSectionUrl(section.id)}/`, '_blank')}
          >
            View all {section.title} articles
            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
