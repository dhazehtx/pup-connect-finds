
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  Heart,
  MessageCircle,
  Star,
  Crown,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';

const PremiumAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeMetric, setActiveMetric] = useState('overview');

  const metrics = [
    {
      title: 'Total Views',
      value: '12,547',
      change: '+23.5%',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Listing Inquiries',
      value: '892',
      change: '+18.2%',
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Revenue Generated',
      value: '$24,850',
      change: '+31.4%',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Conversion Rate',
      value: '7.1%',
      change: '+2.3%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const topPerformingListings = [
    {
      id: 1,
      name: 'Golden Retriever - Max',
      views: 1245,
      inquiries: 34,
      revenue: '$3,200',
      image: '/placeholder.svg'
    },
    {
      id: 2,
      name: 'French Bulldog - Luna',
      views: 987,
      inquiries: 28,
      revenue: '$4,500',
      image: '/placeholder.svg'
    },
    {
      id: 3,
      name: 'German Shepherd - Rex',
      views: 876,
      inquiries: 22,
      revenue: '$2,800',
      image: '/placeholder.svg'
    }
  ];

  const audienceInsights = [
    { location: 'California', percentage: 32, count: 4012 },
    { location: 'Texas', percentage: 18, count: 2256 },
    { location: 'Florida', percentage: 15, count: 1881 },
    { location: 'New York', percentage: 12, count: 1506 },
    { location: 'Others', percentage: 23, count: 2892 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Premium Analytics
          </h2>
          <p className="text-gray-600">Advanced insights for your listings and business</p>
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
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-green-600">
                    {metric.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeMetric} onValueChange={setActiveMetric}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  [Chart showing views, inquiries, and conversions over time]
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Visitor Demographics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audienceInsights.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.location}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <img 
                        src={listing.image} 
                        alt={listing.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium">{listing.name}</h4>
                        <p className="text-sm text-gray-600">
                          {listing.views} views • {listing.inquiries} inquiries
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{listing.revenue}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audienceInsights.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2">
                      <span className="font-medium">{item.location}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{item.count} visitors</span>
                        <Badge variant="outline">{item.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Peak Hours</h4>
                    <p className="text-sm text-blue-700">Most activity between 7-9 PM EST</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Best Days</h4>
                    <p className="text-sm text-green-700">Weekends show 40% higher engagement</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900">Device Preference</h4>
                    <p className="text-sm text-purple-700">65% mobile, 35% desktop users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-green-600">$24,850</p>
                  <p className="text-sm text-gray-600">+31.4% from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">$2,785</p>
                  <p className="text-sm text-gray-600">+12.3% from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-blue-600">$1,988</p>
                  <p className="text-sm text-gray-600">8% platform fee</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiumAnalyticsDashboard;
