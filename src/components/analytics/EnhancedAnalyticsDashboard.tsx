
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Target,
  PieChart,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalListings: number;
    totalRevenue: number;
    totalMessages: number;
    conversionRate: number;
    avgResponseTime: number;
  };
  timeSeriesData: Array<{
    date: string;
    views: number;
    inquiries: number;
    revenue: number;
    newUsers: number;
  }>;
  performanceMetrics: Array<{
    metric: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  topListings: Array<{
    id: string;
    name: string;
    views: number;
    inquiries: number;
    revenue: number;
  }>;
  userBehavior: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
}

const EnhancedAnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('views');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    // Mock data - replace with actual API calls
    const mockData: AnalyticsData = {
      overview: {
        totalViews: 45620,
        totalListings: 342,
        totalRevenue: 125480,
        totalMessages: 2847,
        conversionRate: 8.4,
        avgResponseTime: 2.3
      },
      timeSeriesData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        views: Math.floor(Math.random() * 200) + 100,
        inquiries: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 1000) + 500,
        newUsers: Math.floor(Math.random() * 20) + 5
      })),
      performanceMetrics: [
        { metric: 'View Rate', value: 94.2, change: 5.2, trend: 'up' },
        { metric: 'Inquiry Rate', value: 12.8, change: -2.1, trend: 'down' },
        { metric: 'Response Rate', value: 87.5, change: 3.4, trend: 'up' },
        { metric: 'Completion Rate', value: 78.9, change: 1.8, trend: 'up' }
      ],
      topListings: [
        { id: '1', name: 'Golden Retriever - Luna', views: 1247, inquiries: 89, revenue: 1200 },
        { id: '2', name: 'Labrador - Max', views: 1156, inquiries: 76, revenue: 900 },
        { id: '3', name: 'German Shepherd - Rex', views: 987, inquiries: 65, revenue: 1500 },
        { id: '4', name: 'Bulldog - Buddy', views: 845, inquiries: 54, revenue: 800 },
        { id: '5', name: 'Poodle - Bella', views: 732, inquiries: 43, revenue: 1100 }
      ],
      userBehavior: [
        { action: 'Browse Listings', count: 15420, percentage: 42.3 },
        { action: 'View Details', count: 8950, percentage: 24.5 },
        { action: 'Contact Seller', count: 4280, percentage: 11.7 },
        { action: 'Save Favorite', count: 3840, percentage: 10.5 },
        { action: 'Share Listing', count: 2680, percentage: 7.3 },
        { action: 'Compare Listings', count: 1340, percentage: 3.7 }
      ]
    };
    
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  };

  const MetricCard = ({ title, value, icon: Icon, change, trend, suffix = '' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}{suffix}</p>
            {change !== undefined && (
              <p className={`text-xs flex items-center gap-1 mt-1 ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
                {Math.abs(change)}% from last period
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Views"
          value={data.overview.totalViews.toLocaleString()}
          icon={Eye}
          change={12.5}
          trend="up"
        />
        <MetricCard
          title="Active Listings"
          value={data.overview.totalListings}
          icon={PieChart}
          change={8.2}
          trend="up"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${data.overview.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={15.7}
          trend="up"
        />
        <MetricCard
          title="Messages Sent"
          value={data.overview.totalMessages.toLocaleString()}
          icon={MessageCircle}
          change={-2.1}
          trend="down"
        />
        <MetricCard
          title="Conversion Rate"
          value={data.overview.conversionRate}
          icon={Target}
          change={3.4}
          trend="up"
          suffix="%"
        />
        <MetricCard
          title="Avg Response Time"
          value={data.overview.avgResponseTime}
          icon={Calendar}
          change={-8.5}
          trend="up"
          suffix="h"
        />
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="listings">Top Listings</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Performance Trends</span>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="inquiries">Inquiries</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="newUsers">New Users</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                      <p className="text-2xl font-bold">{metric.value}%</p>
                    </div>
                    <Badge variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </Badge>
                  </div>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topListings.map((listing, index) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{listing.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {listing.views} views • {listing.inquiries} inquiries
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${listing.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Actions Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={data.userBehavior}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ action, percentage }) => `${action} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.userBehavior.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Action Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.userBehavior.map((action, index) => (
                    <div key={action.action} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{action.action}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{action.count.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{action.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
