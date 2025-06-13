
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Heart, BarChart3 } from 'lucide-react';
import RealTimeAnalytics from './RealTimeAnalytics';
import UserActivityTracker from './UserActivityTracker';
import ListingPerformanceMetrics from './ListingPerformanceMetrics';
import EngagementAnalytics from './EngagementAnalytics';

const ComprehensiveAnalyticsDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Advanced Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Real-time insights into user activity, listing performance, and platform engagement
        </p>
      </div>

      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Real-Time
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            User Activity
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Listing Performance
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="mt-6">
          <RealTimeAnalytics />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <UserActivityTracker />
          </div>
        </TabsContent>

        <TabsContent value="listings" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <ListingPerformanceMetrics />
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <EngagementAnalytics />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveAnalyticsDashboard;
