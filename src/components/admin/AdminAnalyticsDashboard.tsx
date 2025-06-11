
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MessageSquare, DollarSign, Eye, Heart } from 'lucide-react';

const AdminAnalyticsDashboard = () => {
  const [analyticsData] = useState({
    overview: {
      totalUsers: 12450,
      dailyActiveUsers: 3200,
      totalListings: 8900,
      monthlyRevenue: 45600,
      conversionRate: 3.8,
      averageSessionTime: 12.5
    },
    userGrowth: [
      { month: 'Jan', users: 8500, active: 2100 },
      { month: 'Feb', users: 9200, active: 2400 },
      { month: 'Mar', users: 10100, active: 2800 },
      { month: 'Apr', users: 11200, active: 3000 },
      { month: 'May', users: 12450, active: 3200 },
    ],
    revenueData: [
      { month: 'Jan', subscription: 28000, commission: 12000, ads: 5000 },
      { month: 'Feb', subscription: 32000, commission: 14000, ads: 6000 },
      { month: 'Mar', subscription: 35000, commission: 16000, ads: 7000 },
      { month: 'Apr', subscription: 38000, commission: 18000, ads: 8000 },
      { month: 'May', subscription: 42000, commission: 20000, ads: 9000 },
    ],
    deviceStats: [
      { name: 'Mobile', value: 65, color: '#8884d8' },
      { name: 'Desktop', value: 25, color: '#82ca9d' },
      { name: 'Tablet', value: 10, color: '#ffc658' },
    ],
    topPages: [
      { page: '/explore', views: 45600, bounce: 32 },
      { page: '/listing/*', views: 38200, bounce: 28 },
      { page: '/profile/*', views: 25800, bounce: 35 },
      { page: '/messages', views: 22100, bounce: 15 },
    ]
  });

  const StatCard = ({ title, value, icon: Icon, trend, color = "text-gray-600" }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-xs flex items-center gap-1 mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
                {Math.abs(trend)}% from last month
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Users"
          value={analyticsData.overview.totalUsers.toLocaleString()}
          icon={Users}
          trend={12}
          color="text-blue-500"
        />
        <StatCard
          title="Daily Active Users"
          value={analyticsData.overview.dailyActiveUsers.toLocaleString()}
          icon={Eye}
          trend={8}
          color="text-green-500"
        />
        <StatCard
          title="Total Listings"
          value={analyticsData.overview.totalListings.toLocaleString()}
          icon={Heart}
          trend={15}
          color="text-purple-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${analyticsData.overview.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={6}
          color="text-green-600"
        />
        <StatCard
          title="Conversion Rate"
          value={`${analyticsData.overview.conversionRate}%`}
          icon={TrendingUp}
          trend={2}
          color="text-blue-600"
        />
        <StatCard
          title="Avg Session Time"
          value={`${analyticsData.overview.averageSessionTime}m`}
          icon={MessageSquare}
          trend={-3}
          color="text-orange-500"
        />
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="active" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.8} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="subscription" fill="#8884d8" />
                  <Bar dataKey="commission" fill="#82ca9d" />
                  <Bar dataKey="ads" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData.deviceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.deviceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{page.page}</p>
                        <p className="text-sm text-gray-600">{page.views.toLocaleString()} views</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Bounce: {page.bounce}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Server Response Time</span>
                      <span>245ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Database Query Time</span>
                      <span>42ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CDN Cache Hit Rate</span>
                      <span>94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm">Critical Errors</span>
                    <span className="font-bold text-red-600">0</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="text-sm">Warnings</span>
                    <span className="font-bold text-orange-600">3</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm">Info Messages</span>
                    <span className="font-bold text-blue-600">47</span>
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

export default AdminAnalyticsDashboard;
