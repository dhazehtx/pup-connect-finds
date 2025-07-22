
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinalTestingSuite from '@/components/testing/FinalTestingSuite';
import ProductionReadinessChecklist from '@/components/testing/ProductionReadinessChecklist';

const FinalTesting = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Tabs defaultValue="testing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="testing">Testing Suite</TabsTrigger>
          <TabsTrigger value="readiness">Production Readiness</TabsTrigger>
        </TabsList>

        <TabsContent value="testing">
          <FinalTestingSuite />
        </TabsContent>

        <TabsContent value="readiness">
          <ProductionReadinessChecklist />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinalTesting;
