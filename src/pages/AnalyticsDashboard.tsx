
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import ListingAnalyticsDashboard from '@/components/analytics/ListingAnalyticsDashboard';
import ProfileAnalytics from '@/components/profile/ProfileAnalytics';

const AnalyticsDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive insights into your listings, performance, and user engagement
        </p>
      </div>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="listings" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Listing Analytics
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Profile Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          <ListingAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
