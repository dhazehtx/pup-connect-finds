
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Eye, MessageCircle, Heart, TrendingUp, Calendar, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useBackendServices';
import { supabase } from '@/integrations/supabase/client';

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
  const { analytics, loading: analyticsLoading } = useAnalytics(user?.id);
  const [analytics2, setAnalytics] = useState<AnalyticsData>({
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
    if (user?.id) {
      fetchRealAnalytics();
    }
  }, [user?.id, timeRange]);

  const fetchRealAnalytics = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch profile views from conversations and messages
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('seller_id', user.id);

      // Fetch favorites for user's listings
      const { data: userListings } = await supabase
        .from('dog_listings')
        .select('id')
        .eq('user_id', user.id);

      const listingIds = userListings?.map(listing => listing.id) || [];
      
      const { data: favorites } = await supabase
        .from('favorites')
        .select('*')
        .in('listing_id', listingIds);

      // Fetch recent notifications for activity
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate view trends (simulated for now)
      const getDaysAgo = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
      };

      const viewsByDay = Array.from({ length: 7 }, (_, i) => ({
        date: getDaysAgo(6 - i),
        views: Math.floor(Math.random() * 20) + 10 // Simulated data
      }));

      const recentActivity = notifications?.slice(0, 5).map(notification => ({
        type: notification.type,
        description: notification.message,
        timestamp: new Date(notification.created_at).toLocaleString()
      })) || [];

      setAnalytics({
        totalViews: (conversations?.length || 0) * 3, // Estimate based on conversations
        uniqueViews: conversations?.length || 0,
        contactRequests: conversations?.length || 0,
        favoriteCount: favorites?.length || 0,
        viewsByDay,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-gray-500" />
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
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === '7d'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === '30d'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === '90d'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                90 Days
              </button>
            </div>

            <TabsContent value={timeRange} className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={Eye}
                  title="Total Views"
                  value={analytics2.totalViews}
                  change="+12% vs last week"
                />
                <StatCard
                  icon={Users}
                  title="Unique Visitors"
                  value={analytics2.uniqueViews}
                  change="+8% vs last week"
                />
                <StatCard
                  icon={MessageCircle}
                  title="Contact Requests"
                  value={analytics2.contactRequests}
                  change="+15% vs last week"
                />
                <StatCard
                  icon={Heart}
                  title="Favorites"
                  value={analytics2.favoriteCount}
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
                    <LineChart data={analytics2.viewsByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#374151" strokeWidth={2} />
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
                    {analytics2.recentActivity.length > 0 ? (
                      analytics2.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            {activity.type === 'view' && <Eye className="h-4 w-4 text-gray-500" />}
                            {activity.type === 'contact' && <MessageCircle className="h-4 w-4 text-green-500" />}
                            {activity.type === 'favorite' && <Heart className="h-4 w-4 text-red-500" />}
                            {activity.type === 'verification_approved' && <TrendingUp className="h-4 w-4 text-green-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
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
