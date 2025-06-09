
import React from 'react';
import { Button } from '@/components/ui/button';

interface RecommendationHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

const RecommendationHeader = ({ loading, onRefresh }: RecommendationHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold">Location-Based Recommendations</h2>
        <p className="text-gray-600">Personalized suggestions based on your location</p>
      </div>
      <Button onClick={onRefresh} disabled={loading} variant="outline">
        {loading ? 'Loading...' : 'Refresh'}
      </Button>
    </div>
  );
};

export default RecommendationHeader;
