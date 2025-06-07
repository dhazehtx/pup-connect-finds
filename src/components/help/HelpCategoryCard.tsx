
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface HelpCategoryCardProps {
  title: string;
  icon: React.ReactNode;
  articles: number;
  description: string;
  path: string;
}

const HelpCategoryCard: React.FC<HelpCategoryCardProps> = ({
  title,
  icon,
  articles,
  description,
  path
}) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="border-soft-sky hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(path)}
    >
      <CardContent className="p-6 text-center">
        <div className="text-royal-blue mb-4 flex justify-center">
          {icon}
        </div>
        <h3 className="font-semibold text-deep-navy mb-2">{title}</h3>
        <p className="text-sm text-deep-navy/70 mb-3">{description}</p>
        <span className="text-xs text-royal-blue font-medium">{articles} articles</span>
      </CardContent>
    </Card>
  );
};

export default HelpCategoryCard;
