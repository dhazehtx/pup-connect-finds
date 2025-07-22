
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RecommendationCard from './RecommendationCard';

interface RecommendationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  listings: any[];
}

interface RecommendationCategoryProps {
  category: RecommendationCategory;
}

const RecommendationCategory = ({ category }: RecommendationCategoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {category.icon}
          <div>
            <span>{category.title}</span>
            <p className="text-sm font-normal text-gray-600">{category.description}</p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {category.listings.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {category.listings.map((listing, index) => (
            <RecommendationCard
              key={listing.id || index}
              listing={listing}
              categoryId={category.id}
            />
          ))}
        </div>
        
        {category.listings.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No listings found in this category
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationCategory;
