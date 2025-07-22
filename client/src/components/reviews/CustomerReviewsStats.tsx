
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Heart, Star, MessageSquare } from 'lucide-react';

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
        className="border-royal-blue cursor-pointer hover:shadow-lg transition-shadow bg-royal-blue/10"
        onClick={() => onStatClick('breeders')}
      >
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <Users className="w-8 h-8 text-royal-blue" />
          </div>
          <div className="text-2xl font-bold text-black mb-2">{stats.verifiedBreeders}</div>
          <div className="text-sm text-black/70">Verified Breeders</div>
        </CardContent>
      </Card>
      
      <Card 
        className="border-royal-blue cursor-pointer hover:shadow-lg transition-shadow bg-royal-blue/10"
        onClick={() => onStatClick('adoptions')}
      >
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <Heart className="w-8 h-8 text-royal-blue" />
          </div>
          <div className="text-2xl font-bold text-black mb-2">{stats.successfulAdoptions}</div>
          <div className="text-sm text-black/70">Successful Adoptions</div>
        </CardContent>
      </Card>
      
      <Card 
        className="border-royal-blue cursor-pointer hover:shadow-lg transition-shadow bg-royal-blue/10"
        onClick={() => onStatClick('rating')}
      >
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <Star className="w-8 h-8 text-royal-blue fill-royal-blue" />
          </div>
          <div className="text-2xl font-bold text-black mb-2">{stats.averageRating}/5</div>
          <div className="text-sm text-black/70">Average Rating</div>
        </CardContent>
      </Card>
      
      <Card className="border-royal-blue bg-royal-blue/10">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <MessageSquare className="w-8 h-8 text-royal-blue" />
          </div>
          <div className="text-2xl font-bold text-black mb-2">{stats.totalReviews}</div>
          <div className="text-sm text-black/70">Total Reviews</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerReviewsStats;
