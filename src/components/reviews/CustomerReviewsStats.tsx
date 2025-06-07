
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsData {
  verifiedBreeders: number;
  successfulAdoptions: number;
  averageRating: number;
  totalReviews: number;
}

interface CustomerReviewsStatsProps {
  stats: StatsData;
  loading: boolean;
  onStatClick: (statType: string) => void;
}

const CustomerReviewsStats: React.FC<CustomerReviewsStatsProps> = ({ 
  stats, 
  loading, 
  onStatClick 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      <Card 
        className="border-border cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onStatClick('breeders')}
      >
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-primary mb-2">{stats.verifiedBreeders}</div>
          <div className="text-sm text-muted-foreground">Verified Breeders</div>
        </CardContent>
      </Card>
      
      <Card 
        className="border-border cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onStatClick('adoptions')}
      >
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-primary mb-2">{stats.successfulAdoptions}</div>
          <div className="text-sm text-muted-foreground">Successful Adoptions</div>
        </CardContent>
      </Card>
      
      <Card 
        className="border-border cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onStatClick('rating')}
      >
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-primary mb-2">{stats.averageRating}/5</div>
          <div className="text-sm text-muted-foreground">Average Rating</div>
        </CardContent>
      </Card>
      
      <Card className="border-border">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-primary mb-2">{stats.totalReviews}</div>
          <div className="text-sm text-muted-foreground">Total Reviews</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerReviewsStats;
