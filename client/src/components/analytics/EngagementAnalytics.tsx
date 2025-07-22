
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Heart, Share2, Eye, Users, Clock } from 'lucide-react';

interface EngagementData {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

const EngagementAnalytics = () => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');

  const engagementData: EngagementData[] = [
    {
      metric: 'Total Messages',
      current: 2847,
      previous: 2456,
      change: 15.9,
      trend: 'up',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    {
      metric: 'Listing Favorites',
      current: 1923,
      previous: 1734,
      change: 10.9,
      trend: 'up',
      icon: <Heart className="w-5 h-5" />,
      color: 'text-red-600'
    },
    {
      metric: 'Profile Views',
      current: 5672,
      previous: 5234,
      change: 8.4,
      trend: 'up',
      icon: <Eye className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      metric: 'Shares',
      current: 432,
      previous: 389,
      change: 11.1,
      trend: 'up',
      icon: <Share2 className="w-5 h-5" />,
      color: 'text-purple-600'
    },
    {
      metric: 'Active Users',
      current: 1247,
      previous: 1156,
      change: 7.9,
      trend: 'up',
      icon: <Users className="w-5 h-5" />,
      color: 'text-orange-600'
    },
    {
      metric: 'Avg Session Time',
      current: 8.4,
      previous: 7.8,
      change: 7.7,
      trend: 'up',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-indigo-600'
    }
  ];

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatMetricValue = (metric: string, value: number) => {
    if (metric === 'Avg Session Time') {
      return `${value}m`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Engagement Analytics
          </CardTitle>
          <div className="flex gap-1">
            {(['24h', '7d', '30d'] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engagementData.map((data) => (
            <div key={data.metric} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white ${data.color}`}>
                  {data.icon}
                </div>
                <Badge variant="outline" className={getChangeColor(data.change)}>
                  {data.change > 0 ? '+' : ''}{data.change}%
                </Badge>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-medium text-sm text-gray-600">{data.metric}</h4>
                <p className="text-2xl font-bold">
                  {formatMetricValue(data.metric, data.current)}
                </p>
                <p className="text-xs text-gray-500">
                  vs {formatMetricValue(data.metric, data.previous)} last {timeframe}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Engagement Insights */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2 text-blue-900">
            💡 Engagement Insights
          </h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>• Message engagement is up 15.9% - users are more active in conversations</p>
            <p>• Profile views increased by 8.4% indicating better discoverability</p>
            <p>• Session time improved by 7.7% showing higher user satisfaction</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementAnalytics;
