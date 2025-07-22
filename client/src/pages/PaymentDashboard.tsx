
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Shield, Calendar, BarChart3 } from 'lucide-react';
import PaymentMethodsManager from '@/components/payment/PaymentMethodsManager';
import EscrowDashboard from '@/components/payment/EscrowDashboard';

const PaymentDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Payment Center</h1>
        <p className="text-muted-foreground">Manage your payments, escrow, and transaction history</p>
      </div>

      <Tabs defaultValue="payment-methods" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payment-methods" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="escrow" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Escrow
          </TabsTrigger>
          <TabsTrigger value="payment-plans" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Payment Plans
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment-methods">
          <PaymentMethodsManager />
        </TabsContent>

        <TabsContent value="escrow">
          <EscrowDashboard />
        </TabsContent>

        <TabsContent value="payment-plans">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Plans</h3>
            <p className="text-muted-foreground">
              Flexible payment options coming soon
            </p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Analytics</h3>
            <p className="text-muted-foreground">
              Detailed payment insights coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentDashboard;
