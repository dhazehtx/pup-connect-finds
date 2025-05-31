
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Eye, MessageCircle, Heart, Calendar, Award, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/types/profile';

interface AdvancedAnalyticsProps {
  profile: UserProfile;
}

const AdvancedAnalytics = ({ profile }: AdvancedAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  // Mock analytics data - in real app this would come from your analytics service
  const viewsData = [
    { name: 'Mon', views: 120, contacts: 8 },
    { name: 'Tue', views: 150, contacts: 12 },
    { name: 'Wed', views: 180, contacts: 15 },
    { name: 'Thu', views: 140, contacts: 9 },
    { name: 'Fri', views: 200, contacts: 18 },
    { name: 'Sat', views: 250, contacts: 22 },
    { name: 'Sun', views: 180, contacts: 14 }
  ];

  const engagementData = [
    { name: 'Profile Views', value: 1240, color: '#3b82f6' },
    { name: 'Contact Clicks', value: 98, color: '#10b981' },
    { name: 'Share Actions', value: 45, color: '#f59e0b' },
    { name: 'Favorite Adds', value: 67, color: '#ef4444' }
  ];

  const performanceMetrics = [
    {
      title: 'Profile Completion',
      value: '85%',
      change: '+5%',
      icon: <Target className="h-4 w-4" />,
      trend: 'up'
    },
    {
      title: 'Response Rate', 
      value: '94%',
      change: '+2%',
      icon: <MessageCircle className="h-4 w-4" />,
      trend: 'up'
    },
    {
      title: 'Avg Response Time',
      value: '2.1h',
      change: '-15m',
      icon: <Calendar className="h-4 w-4" />,
      trend: 'up'
    },
    {
      title: 'Trust Score',
      value: '4.8/5',
      change: '+0.1',
      icon: <Award className="h-4 w-4" />,
      trend: 'up'
    }
  ];

  const trafficSources = [
    { source: 'Direct Search', percentage: 45, visits: 560 },
    { source: 'Breed Filters', percentage: 30, visits: 374 },
    { source: 'Recommendations', percentage: 15, visits: 187 },
    { source: 'Social Media', percentage: 10, visits: 125 }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {metric.icon}
                  <span className="text-sm font-medium text-gray-600">{metric.title}</span>
                </div>
                <Badge 
                  variant={metric.trend === 'up' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {metric.change}
                </Badge>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{metric.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Views Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Profile Views & Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#3b82f6" name="Views" />
                    <Bar dataKey="contacts" fill="#10b981" name="Contacts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Engagement Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={engagementData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {engagementData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="contacts" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficSources.map((source, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{source.source}</span>
                      <span className="text-sm text-gray-600">{source.visits} visits</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {source.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Optimization Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="font-medium">Add more photos</p>
                      <p className="text-sm text-gray-600">Profiles with 5+ photos get 40% more views</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                    <div>
                      <p className="font-medium">Update availability status</p>
                      <p className="text-sm text-gray-600">Keep your listing status current for better visibility</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="font-medium">Respond faster</p>
                      <p className="text-sm text-gray-600">Aim for under 2 hours response time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Strong Performance</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Your profile views increased by 23% this month
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">High Engagement</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Your contact rate is 15% above average
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Trust Building</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Your verification status boosts credibility
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
