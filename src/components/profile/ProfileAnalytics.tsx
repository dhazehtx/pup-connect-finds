
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Eye, MessageCircle, Heart, TrendingUp, Calendar, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  totalViews: number;
  uniqueViews: number;
  contactRequests: number;
  favoriteCount: number;
  viewsByDay: { date: string; views: number }[];
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

const ProfileAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    uniqueViews: 0,
    contactRequests: 0,
    favoriteCount: 0,
    viewsByDay: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setAnalytics({
        totalViews: 342,
        uniqueViews: 278,
        contactRequests: 15,
        favoriteCount: 23,
        viewsByDay: [
          { date: '2024-01-01', views: 45 },
          { date: '2024-01-02', views: 52 },
          { date: '2024-01-03', views: 38 },
          { date: '2024-01-04', views: 61 },
          { date: '2024-01-05', views: 49 },
          { date: '2024-01-06', views: 55 },
          { date: '2024-01-07', views: 42 },
        ],
        recentActivity: [
          {
            type: 'view',
            description: 'Sarah M. viewed your profile',
            timestamp: '2 hours ago'
          },
          {
            type: 'contact',
            description: 'Mike D. sent you a message',
            timestamp: '4 hours ago'
          },
          {
            type: 'favorite',
            description: 'Jessica L. favorited your listing',
            timestamp: '6 hours ago'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const StatCard = ({ icon: Icon, title, value, change }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-blue-500" />
        </div>
        {change && (
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Profile Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="mb-4">
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>

            <TabsContent value={timeRange} className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={Eye}
                  title="Total Views"
                  value={analytics.totalViews}
                  change="+12% vs last week"
                />
                <StatCard
                  icon={Users}
                  title="Unique Visitors"
                  value={analytics.uniqueViews}
                  change="+8% vs last week"
                />
                <StatCard
                  icon={MessageCircle}
                  title="Contact Requests"
                  value={analytics.contactRequests}
                  change="+15% vs last week"
                />
                <StatCard
                  icon={Heart}
                  title="Favorites"
                  value={analytics.favoriteCount}
                  change="+5% vs last week"
                />
              </div>

              {/* Views Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Views Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.viewsByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {activity.type === 'view' && <Eye className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'contact' && <MessageCircle className="h-4 w-4 text-green-500" />}
                          {activity.type === 'favorite' && <Heart className="h-4 w-4 text-red-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileAnalytics;
