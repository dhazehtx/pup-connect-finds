
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import FraudProtectionSystem from '@/components/security/FraudProtectionSystem';

const SecurityCenter = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Security Dashboard</TabsTrigger>
          <TabsTrigger value="fraud-protection">Fraud Protection</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="fraud-protection">
          <FraudProtectionSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityCenter;
