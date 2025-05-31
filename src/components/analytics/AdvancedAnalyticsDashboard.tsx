
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } = '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, Heart, MessageCircle, DollarSign, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdvancedAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalViews: 1250,
      totalFavorites: 89,
      totalInquiries: 34,
      totalListings: 12,
      averagePrice: 1850,
      conversionRate: 2.7
    },
    viewsOverTime: [
      { date: '2024-01', views: 120, inquiries: 8 },
      { date: '2024-02', views: 180, inquiries: 12 },
      { date: '2024-03', views: 220, inquiries: 15 },
      { date: '2024-04', views: 280, inquiries: 18 },
      { date: '2024-05', views: 450, inquiries: 24 },
    ],
    listingPerformance: [
      { name: 'Golden Retriever Puppy', views: 340, favorites: 28, inquiries: 8, price: 2000 },
      { name: 'Labrador Mix', views: 280, favorites: 22, inquiries: 6, price: 1500 },
      { name: 'German Shepherd', views: 190, favorites: 15, inquiries: 4, price: 2500 },
      { name: 'Beagle Puppy', views: 150, favorites: 12, inquiries: 3, price: 1200 },
    ],
    demographics: [
      { name: 'Age 25-34', value: 35, color: '#8884d8' },
      { name: 'Age 35-44', value: 28, color: '#82ca9d' },
      { name: 'Age 45-54', value: 22, color: '#ffc658' },
      { name: 'Age 18-24', value: 10, color: '#ff7300' },
      { name: 'Age 55+', value: 5, color: '#8dd1e1' },
    ]
  });

  const StatCard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp size={12} className={trend === 'down' ? 'rotate-180' : ''} />
                {trendValue}% from last month
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Views"
          value={analyticsData.overview.totalViews.toLocaleString()}
          icon={Eye}
          trend="up"
          trendValue={15}
        />
        <StatCard
          title="Total Favorites"
          value={analyticsData.overview.totalFavorites}
          icon={Heart}
          trend="up"
          trendValue={8}
        />
        <StatCard
          title="Inquiries"
          value={analyticsData.overview.totalInquiries}
          icon={MessageCircle}
          trend="up"
          trendValue={12}
        />
        <StatCard
          title="Active Listings"
          value={analyticsData.overview.totalListings}
          icon={Users}
          trend="down"
          trendValue={5}
        />
        <StatCard
          title="Average Price"
          value={`$${analyticsData.overview.averagePrice.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue={3}
        />
        <StatCard
          title="Conversion Rate"
          value={`${analyticsData.overview.conversionRate}%`}
          icon={TrendingUp}
          trend="up"
          trendValue={0.5}
        />
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Views & Inquiries Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.viewsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="inquiries" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.8} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Listing Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.listingPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8884d8" />
                  <Bar dataKey="favorites" fill="#82ca9d" />
                  <Bar dataKey="inquiries" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analyticsData.listingPerformance.map((listing, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm mb-2">{listing.name}</h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>Views: {listing.views}</div>
                        <div>Favorites: {listing.favorites}</div>
                        <div>Inquiries: {listing.inquiries}</div>
                        <div className="font-medium text-green-600">${listing.price.toLocaleString()}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.demographics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.demographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.viewsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="inquiries" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
