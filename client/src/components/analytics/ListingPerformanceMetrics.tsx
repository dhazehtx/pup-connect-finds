
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ListingMetric {
  id: string;
  listing_title: string;
  breed: string;
  views: number;
  inquiries: number;
  favorites: number;
  conversion_rate: number;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  price: number;
  created_at: string;
}

const ListingPerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<ListingMetric[]>([]);
  const [sortBy, setSortBy] = useState<'views' | 'inquiries' | 'favorites' | 'conversion_rate'>('views');

  useEffect(() => {
    fetchListingMetrics();
  }, []);

  const fetchListingMetrics = async () => {
    // Mock listing performance data
    const mockMetrics: ListingMetric[] = [
      {
        id: '1',
        listing_title: 'Adorable Golden Retriever Puppies',
        breed: 'Golden Retriever',
        views: 1247,
        inquiries: 23,
        favorites: 89,
        conversion_rate: 1.85,
        trend: 'up',
        change_percentage: 12.5,
        price: 1200,
        created_at: '2024-01-15'
      },
      {
        id: '2',
        listing_title: 'French Bulldog - Champion Bloodline',
        breed: 'French Bulldog',
        views: 892,
        inquiries: 31,
        favorites: 156,
        conversion_rate: 3.47,
        trend: 'up',
        change_percentage: 8.3,
        price: 2500,
        created_at: '2024-01-12'
      },
      {
        id: '3',
        listing_title: 'Labrador Mix Puppies Ready Now',
        breed: 'Labrador Mix',
        views: 634,
        inquiries: 12,
        favorites: 45,
        conversion_rate: 1.89,
        trend: 'down',
        change_percentage: -5.2,
        price: 800,
        created_at: '2024-01-18'
      },
      {
        id: '4',
        listing_title: 'German Shepherd - Working Line',
        breed: 'German Shepherd',
        views: 567,
        inquiries: 18,
        favorites: 72,
        conversion_rate: 3.17,
        trend: 'stable',
        change_percentage: 0.8,
        price: 1800,
        created_at: '2024-01-10'
      }
    ];

    setMetrics(mockMetrics.sort((a, b) => b[sortBy] - a[sortBy]));
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Listing Performance
        </CardTitle>
        <div className="flex gap-2">
          {(['views', 'inquiries', 'favorites', 'conversion_rate'] as const).map((metric) => (
            <Badge
              key={metric}
              variant={sortBy === metric ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSortBy(metric)}
            >
              {metric.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={metric.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h4 className="font-medium text-sm">{metric.listing_title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {metric.breed}
                    </Badge>
                    <span className="text-xs text-gray-500">${metric.price}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend, metric.change_percentage)}
                  <span className={`text-xs font-medium ${getTrendColor(metric.trend)}`}>
                    {metric.change_percentage > 0 ? '+' : ''}{metric.change_percentage}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{formatNumber(metric.views)}</span>
                  </div>
                  <p className="text-xs text-gray-500">Views</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{metric.inquiries}</span>
                  </div>
                  <p className="text-xs text-gray-500">Inquiries</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium">{metric.favorites}</span>
                  </div>
                  <p className="text-xs text-gray-500">Favorites</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">{metric.conversion_rate}%</span>
                  </div>
                  <p className="text-xs text-gray-500">Conversion</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingPerformanceMetrics;
