
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { TrendingUp, Users, Heart, MessageCircle } from 'lucide-react';

const SimpleUserInsights = () => {
  const { recommendations, loading } = useSmartRecommendations();

  const insights = [
    {
      title: 'Recommendations Generated',
      value: recommendations.length,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: '1,234',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Total Favorites',
      value: '5,678',
      icon: Heart,
      color: 'text-red-600'
    },
    {
      title: 'Messages Sent',
      value: '9,876',
      icon: MessageCircle,
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading insights...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {insights.map((insight, index) => {
        const IconComponent = insight.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
              <IconComponent className={`h-4 w-4 ${insight.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insight.value}</div>
              <Badge variant="outline" className="mt-2">
                Active
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SimpleUserInsights;
