
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SimpleUserInsights from '@/components/analytics/SimpleUserInsights';
import ComprehensiveAnalyticsDashboard from '@/components/analytics/ComprehensiveAnalyticsDashboard';

const Analytics = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights">User Insights</TabsTrigger>
          <TabsTrigger value="comprehensive">Comprehensive Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <SimpleUserInsights />
        </TabsContent>

        <TabsContent value="comprehensive">
          <ComprehensiveAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
