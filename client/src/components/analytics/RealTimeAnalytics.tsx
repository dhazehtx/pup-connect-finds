
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Eye, MessageCircle, TrendingUp, Activity, Globe } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface RealTimeData {
  activeUsers: number;
  pageViews: number;
  newMessages: number;
  onlineUsers: string[];
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    userId?: string;
  }>;
  topPages: Array<{
    page: string;
    views: number;
    uniqueUsers: number;
  }>;
}

const RealTimeAnalytics = () => {
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [isLive, setIsLive] = useState(true);
  const { getAnalytics } = useAnalytics();

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(fetchRealTimeData, 5000); // Update every 5 seconds
      fetchRealTimeData(); // Initial fetch
      
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const fetchRealTimeData = async () => {
    // Mock real-time data - in production, this would come from your analytics service
    const mockData: RealTimeData = {
      activeUsers: Math.floor(Math.random() * 50) + 100,
      pageViews: Math.floor(Math.random() * 200) + 500,
      newMessages: Math.floor(Math.random() * 10) + 5,
      onlineUsers: Array.from({ length: Math.floor(Math.random() * 20) + 10 }, (_, i) => `user_${i}`),
      recentActivity: [
        {
          id: '1',
          type: 'listing_view',
          description: 'User viewed Golden Retriever listing',
          timestamp: new Date(Date.now() - Math.random() * 300000).toISOString(),
          userId: 'user_123'
        },
        {
          id: '2',
          type: 'message_sent',
          description: 'New inquiry about Labrador puppy',
          timestamp: new Date(Date.now() - Math.random() * 300000).toISOString(),
          userId: 'user_456'
        },
        {
          id: '3',
          type: 'user_signup',
          description: 'New user registered',
          timestamp: new Date(Date.now() - Math.random() * 300000).toISOString(),
          userId: 'user_789'
        },
        {
          id: '4',
          type: 'listing_created',
          description: 'New German Shepherd listing added',
          timestamp: new Date(Date.now() - Math.random() * 300000).toISOString(),
          userId: 'user_101'
        }
      ],
      topPages: [
        { page: '/explore', views: 1247, uniqueUsers: 892 },
        { page: '/listing/golden-retriever', views: 823, uniqueUsers: 645 },
        { page: '/profile/breeder-123', views: 456, uniqueUsers: 342 },
        { page: '/messages', views: 234, uniqueUsers: 189 }
      ]
    };

    setRealTimeData(mockData);
  };

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'listing_view': return <Eye className="w-4 h-4" />;
      case 'message_sent': return <MessageCircle className="w-4 h-4" />;
      case 'user_signup': return <Users className="w-4 h-4" />;
      case 'listing_created': return <TrendingUp className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'listing_view': return 'text-blue-600 bg-blue-100';
      case 'message_sent': return 'text-green-600 bg-green-100';
      case 'user_signup': return 'text-purple-600 bg-purple-100';
      case 'listing_created': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!realTimeData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Real-Time Analytics</h2>
          <Badge variant={isLive ? 'default' : 'secondary'} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isLive ? 'LIVE' : 'PAUSED'}
          </Badge>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsLive(!isLive)}
        >
          {isLive ? 'Pause' : 'Resume'} Live Updates
        </Button>
      </div>

      {/* Real-time metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{realTimeData.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary">{realTimeData.onlineUsers.length} online now</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">{realTimeData.pageViews}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary">Last 5 minutes</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Messages</p>
                <p className="text-2xl font-bold">{realTimeData.newMessages}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary">Last hour</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                <p className="text-2xl font-bold">4.2m</p>
              </div>
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary">Duration</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {realTimeData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages (Real-time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {realTimeData.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{page.page}</p>
                      <p className="text-xs text-muted-foreground">{page.uniqueUsers} unique users</p>
                    </div>
                  </div>
                  <Badge variant="outline">{page.views} views</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;
