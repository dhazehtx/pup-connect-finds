
import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Eye, Heart, MessageCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const viewsData = [
    { month: 'Jan', views: 4000, interactions: 2400 },
    { month: 'Feb', views: 3000, interactions: 1398 },
    { month: 'Mar', views: 2000, interactions: 9800 },
    { month: 'Apr', views: 2780, interactions: 3908 },
    { month: 'May', views: 1890, interactions: 4800 },
    { month: 'Jun', views: 2390, interactions: 3800 },
  ];

  const breedPopularity = [
    { name: 'Golden Retriever', value: 25, color: '#3B82F6' },
    { name: 'Labrador', value: 20, color: '#10B981' },
    { name: 'German Shepherd', value: 15, color: '#F59E0B' },
    { name: 'French Bulldog', value: 12, color: '#EF4444' },
    { name: 'Others', value: 28, color: '#8B5CF6' },
  ];

  const performanceMetrics = [
    {
      title: 'Total Listings Views',
      value: '127,543',
      change: '+12.5%',
      icon: <Eye className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'User Interactions',
      value: '45,231',
      change: '+8.2%',
      icon: <Users className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Favorites Added',
      value: '12,847',
      change: '+15.3%',
      icon: <Heart className="h-5 w-5" />,
      color: 'text-red-500'
    },
    {
      title: 'Messages Sent',
      value: '8,943',
      change: '+6.7%',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">Analytics Dashboard</h1>
              <p className="text-xl opacity-90">Track platform performance and user engagement</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 bg-white text-deep-navy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {performanceMetrics.map((metric, index) => (
            <Card key={index} className="border-soft-sky">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${metric.color}`}>
                    {metric.icon}
                  </div>
                  <span className="text-xs text-green-600 font-medium">{metric.change}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-deep-navy">{metric.value}</p>
                  <p className="text-sm text-deep-navy/60">{metric.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Views and Interactions Chart */}
          <Card className="border-soft-sky">
            <CardHeader>
              <CardTitle className="text-deep-navy">Views & Interactions Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3B82F6" />
                  <Bar dataKey="interactions" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Breed Popularity Chart */}
          <Card className="border-soft-sky">
            <CardHeader>
              <CardTitle className="text-deep-navy">Most Popular Breeds</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={breedPopularity}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {breedPopularity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Activity */}
        <Card className="border-soft-sky mb-8">
          <CardHeader>
            <CardTitle className="text-deep-navy flex items-center">
              <TrendingUp className="mr-2" />
              Real-time Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-royal-blue mb-2">47</div>
                <p className="text-deep-navy/70">Active Users</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">12</div>
                <p className="text-deep-navy/70">New Listings Today</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">234</div>
                <p className="text-deep-navy/70">Messages Sent Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card className="border-soft-sky">
          <CardHeader>
            <CardTitle className="text-deep-navy">Export Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white">
                <BarChart3 className="mr-2" size={16} />
                Export Charts
              </Button>
              <Button variant="outline" className="border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white">
                <Calendar className="mr-2" size={16} />
                Schedule Report
              </Button>
              <Button className="bg-royal-blue hover:bg-deep-navy">
                Download Full Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
