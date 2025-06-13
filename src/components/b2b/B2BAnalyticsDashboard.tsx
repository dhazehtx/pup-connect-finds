
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3,
  Download,
  FileText,
  Globe,
  Target,
  Building2,
  Calendar
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface B2BMetrics {
  totalBusinesses: number;
  monthlyRevenue: number;
  apiCalls: number;
  dataReports: number;
  growthRate: number;
}

interface RegionalData {
  region: string;
  businesses: number;
  revenue: number;
  growth: number;
}

interface IndustryInsight {
  sector: string;
  marketShare: number;
  avgTransactionValue: number;
  customerLifetimeValue: number;
}

const B2BAnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<B2BMetrics>({
    totalBusinesses: 1247,
    monthlyRevenue: 89500,
    apiCalls: 156789,
    dataReports: 342,
    growthRate: 34.7
  });

  const [regionalData] = useState<RegionalData[]>([
    { region: 'North America', businesses: 456, revenue: 45600, growth: 23.4 },
    { region: 'Europe', businesses: 234, revenue: 23400, growth: 18.7 },
    { region: 'Asia Pacific', businesses: 189, revenue: 15200, growth: 41.2 },
    { region: 'Latin America', businesses: 123, revenue: 8900, growth: 28.9 }
  ]);

  const [industryInsights] = useState<IndustryInsight[]>([
    { sector: 'Pet Insurance', marketShare: 34.2, avgTransactionValue: 1250, customerLifetimeValue: 15600 },
    { sector: 'Veterinary Services', marketShare: 28.7, avgTransactionValue: 890, customerLifetimeValue: 12400 },
    { sector: 'Pet Food & Nutrition', marketShare: 23.1, avgTransactionValue: 560, customerLifetimeValue: 8900 },
    { sector: 'Pet Tech & Apps', marketShare: 14.0, avgTransactionValue: 340, customerLifetimeValue: 4500 }
  ]);

  const revenueData = [
    { month: 'Jan', b2bRevenue: 45600, apiRevenue: 12300, dataRevenue: 8900 },
    { month: 'Feb', b2bRevenue: 52300, apiRevenue: 14500, dataRevenue: 9800 },
    { month: 'Mar', b2bRevenue: 61200, apiRevenue: 16800, dataRevenue: 11200 },
    { month: 'Apr', b2bRevenue: 68900, apiRevenue: 18200, dataRevenue: 12600 },
    { month: 'May', b2bRevenue: 75400, apiRevenue: 20100, dataRevenue: 13800 },
    { month: 'Jun', b2bRevenue: 89500, apiRevenue: 23400, dataRevenue: 15600 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            B2B Analytics Dashboard
          </h2>
          <p className="text-gray-600 mt-2">Business intelligence and data insights platform</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Enterprise Ready
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">B2B Clients</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.totalBusinesses)}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +{metrics.growthRate}% this quarter
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +28% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Calls</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.apiCalls)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +45% this month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Reports</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.dataReports)}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +22% this month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue Streams</TabsTrigger>
          <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
          <TabsTrigger value="industry">Industry Insights</TabsTrigger>
          <TabsTrigger value="products">Data Products</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>B2B Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="b2bRevenue" fill="#3B82F6" name="B2B Subscriptions" />
                  <Bar dataKey="apiRevenue" fill="#10B981" name="API Access" />
                  <Bar dataKey="dataRevenue" fill="#F59E0B" name="Data Licensing" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalData.map((region) => (
                    <div key={region.region} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{region.region}</h4>
                        <p className="text-sm text-gray-600">{region.businesses} businesses</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(region.revenue)}</p>
                        <p className="text-sm text-green-600">+{region.growth}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={regionalData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ region, businesses }) => `${region}: ${businesses}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="businesses"
                    >
                      {regionalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="industry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Sector Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {industryInsights.map((industry) => (
                  <div key={industry.sector} className="p-6 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">{industry.sector}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Market Share</span>
                        <span className="font-medium">{industry.marketShare}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Transaction</span>
                        <span className="font-medium">{formatCurrency(industry.avgTransactionValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer LTV</span>
                        <span className="font-medium">{formatCurrency(industry.customerLifetimeValue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Market Analytics API</h3>
                    <p className="text-sm text-gray-600">Real-time pet market data</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly calls</span>
                    <span className="font-medium">45.2K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Revenue</span>
                    <span className="font-medium">$12,340</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Industry Reports</h3>
                    <p className="text-sm text-gray-600">Quarterly market insights</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Reports sold</span>
                    <span className="font-medium">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Revenue</span>
                    <span className="font-medium">$15,600</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-8 w-8 text-purple-500" />
                  <div>
                    <h3 className="font-semibold">Custom Analytics</h3>
                    <p className="text-sm text-gray-600">Tailored business insights</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active clients</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Revenue</span>
                    <span className="font-medium">$28,900</span>
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

export default B2BAnalyticsDashboard;
