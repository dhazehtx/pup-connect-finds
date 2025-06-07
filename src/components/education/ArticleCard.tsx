
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, ExternalLink } from 'lucide-react';

interface Article {
  title: string;
  description: string;
  url: string;
  readTime: string;
  rating: number;
  difficulty: string;
}

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => window.open(article.url, '_blank')}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
          {article.title}
        </h4>
        <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors ml-2 flex-shrink-0" />
      </div>
      
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {article.description}
      </p>
      
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <Clock size={12} />
        <span>{article.readTime}</span>
        <Star size={12} className="text-amber-500 fill-current ml-2" />
        <span>{article.rating}</span>
      </div>

      <div className="flex items-center justify-between">
        <Badge 
          variant="outline" 
          className={`text-xs ${getDifficultyColor(article.difficulty)}`}
        >
          {article.difficulty}
        </Badge>
        
        <span className="text-xs text-blue-600 font-medium">
          Read Article →
        </span>
      </div>
    </div>
  );
};
