import React from 'react';
import RateLimitDemo from '@/components/demo/RateLimitDemo';
import AbuseMonitoringPanel from '@/components/admin/AbuseMonitoringPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RateLimitDemoPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="demo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="demo">Rate Limiting Demo</TabsTrigger>
            <TabsTrigger value="monitoring">Abuse Monitoring</TabsTrigger>
          </TabsList>
          
          <TabsContent value="demo">
            <RateLimitDemo />
          </TabsContent>
          
          <TabsContent value="monitoring">
            <AbuseMonitoringPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RateLimitDemoPage;