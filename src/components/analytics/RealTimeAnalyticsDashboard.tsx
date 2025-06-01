
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';
import { 
  Users, 
  Eye, 
  MousePointer, 
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';

const RealTimeAnalyticsDashboard = () => {
  const { analytics, refreshAnalytics } = useRealTimeAnalytics();

  useEffect(() => {
    // Refresh analytics every 30 seconds
    const interval = setInterval(refreshAnalytics, 30000);
    return () => clearInterval(interval);
  }, [refreshAnalytics]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-Time Analytics</h2>
        <Badge variant="outline" className="animate-pulse">
          <Activity className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.real_time_users}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Page Views (24h)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.user_behavior.page_views}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.user_behavior.clicks}
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Session</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(analytics.user_behavior.session_duration / 60)}m
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Pages (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.page_views.slice(0, 10).map((page, index) => (
              <div key={page.page} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{page.page || '/'}</p>
                    <p className="text-sm text-gray-600">
                      {page.unique_visitors} unique visitors
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{page.views}</p>
                  <p className="text-sm text-gray-600">views</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm">New user joined</span>
              <span className="text-xs text-gray-500">Just now</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <span className="text-sm">Listing viewed: Golden Retriever</span>
              <span className="text-xs text-gray-500">2 minutes ago</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
              <span className="text-sm">Search performed: "labrador puppies"</span>
              <span className="text-xs text-gray-500">3 minutes ago</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
              <span className="text-sm">Message sent to breeder</span>
              <span className="text-xs text-gray-500">5 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeAnalyticsDashboard;
