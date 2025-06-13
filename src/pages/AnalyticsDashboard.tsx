
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserInsightsDashboard from '@/components/analytics/UserInsightsDashboard';
import ListingPerformanceDashboard from '@/components/analytics/ListingPerformanceDashboard';

const AnalyticsDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights">Personal Insights</TabsTrigger>
          <TabsTrigger value="performance">Listing Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <UserInsightsDashboard />
        </TabsContent>

        <TabsContent value="performance">
          <ListingPerformanceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
