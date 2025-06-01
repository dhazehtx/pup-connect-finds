
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, BarChart3, Brain, Star } from 'lucide-react';
import PremiumAnalyticsDashboard from '@/components/analytics/PremiumAnalyticsDashboard';
import PremiumFeatures from '@/components/premium/PremiumFeatures';
import EnhancedAIFeatures from '@/components/ai/EnhancedAIFeatures';
import MonetizationDashboard from '@/components/monetization/MonetizationDashboard';

const PremiumDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            Premium Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Advanced tools and insights for premium users</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
            PRO PLAN
          </Badge>
          <Badge variant="outline">
            Premium Member Since 2024
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">$24,850</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Featured Listings</p>
                <p className="text-2xl font-bold text-yellow-600">15</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Generations</p>
                <p className="text-2xl font-bold text-purple-600">127</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Premium Score</p>
                <p className="text-2xl font-bold text-blue-600">9.2/10</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="ai">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MonetizationDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PremiumAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <PremiumFeatures />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <EnhancedAIFeatures />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiumDashboard;
