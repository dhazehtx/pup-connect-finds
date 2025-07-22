
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star } from 'lucide-react';
import { EducationResource } from '../../hooks/useEducationSearch';

interface RelatedArticlesProps {
  currentResource: EducationResource;
  allResources: EducationResource[];
  onResourceClick: (resource: EducationResource) => void;
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  currentResource,
  allResources,
  onResourceClick
}) => {
  const getRelatedArticles = () => {
    // Get articles from related IDs if available
    const relatedById = currentResource.relatedArticles
      ? allResources.filter(resource => 
          currentResource.relatedArticles?.includes(resource.id) && 
          resource.id !== currentResource.id
        )
      : [];

    // If we don't have enough related articles, find similar ones by category and tags
    if (relatedById.length < 3) {
      const similarArticles = allResources
        .filter(resource => {
          if (resource.id === currentResource.id) return false;
          if (relatedById.some(related => related.id === resource.id)) return false;
          
          // Check if same category or has common tags
          const sameCategory = resource.category === currentResource.category;
          const commonTags = resource.tags.some(tag => 
            currentResource.tags.includes(tag)
          );
          
          return sameCategory || commonTags;
        })
        .slice(0, 3 - relatedById.length);

      return [...relatedById, ...similarArticles];
    }

    return relatedById.slice(0, 3);
  };

  const relatedArticles = getRelatedArticles();

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Related Articles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => onResourceClick(article)}
              className="flex gap-4 p-3 rounded-lg border hover:shadow-md transition-shadow cursor-pointer group"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {article.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-current" />
                    {article.rating}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {article.difficulty}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
