
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedAnalyticsDashboard from '@/components/analytics/EnhancedAnalyticsDashboard';
import RealTimeAnalytics from '@/components/analytics/RealTimeAnalytics';
import ListingAnalyticsDashboard from '@/components/analytics/ListingAnalyticsDashboard';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <AnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="realtime">
          <RealTimeAnalytics />
        </TabsContent>
        
        <TabsContent value="listings">
          <ListingAnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="enhanced">
          <EnhancedAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
