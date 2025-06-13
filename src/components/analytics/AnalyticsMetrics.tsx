
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Eye, Search, Heart } from 'lucide-react';

interface MetricsProps {
  userMetrics: {
    total_sessions: number;
    total_listings_viewed: number;
    total_searches: number;
    total_favorites: number;
    total_messages_sent: number;
    avg_session_duration: number;
    conversion_rate: number;
    last_active: string;
    total_page_views: number;
  };
}

const AnalyticsMetrics = ({ userMetrics }: MetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{userMetrics?.total_sessions || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Listings Viewed</p>
              <p className="text-2xl font-bold">{userMetrics?.total_listings_viewed || 0}</p>
            </div>
            <Eye className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Searches Made</p>
              <p className="text-2xl font-bold">{userMetrics?.total_searches || 0}</p>
            </div>
            <Search className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Favorites</p>
              <p className="text-2xl font-bold">{userMetrics?.total_favorites || 0}</p>
            </div>
            <Heart className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsMetrics;
