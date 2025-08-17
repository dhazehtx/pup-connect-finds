
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Users, Briefcase, Store } from 'lucide-react';
import ServicesMarketplace from '@/components/services/ServicesMarketplace';
import PupBoxSubscription from '@/components/subscriptions/PupBoxSubscription';
import StoreTab from './Marketplace/StoreTab';
import { ServicesTab } from './Services/ServicesTab';
import AdBanner from '@/components/advertising/AdBanner';
import CartFab from '@/components/ui/CartFab';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('services');

  const tabs = [
    { key: 'services', label: 'Pet Services', component: <ServicesTab /> },
    { key: 'pupbox', label: 'Pup Box', component: <PupBoxSubscription /> },
    { key: 'store', label: 'Store', component: <StoreTab /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Ad Banner */}
      <div className="container mx-auto px-4 py-6">
        <AdBanner targetPage="marketplace" format="banner" className="mb-6" />
      </div>

      <div className="container mx-auto px-4 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="marketplace space-y-6">
          <TabsList className="inline-flex rounded-full border-2 bg-white p-1 max-w-lg mx-auto" style={{ borderColor: 'var(--mp-border)' }}>
            <TabsTrigger 
              value="services" 
              className="tab px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-full transition-all duration-200 focus-visible:!ring-0 focus-visible:!ring-offset-0"
              style={{ 
                color: 'var(--mp-accent)', 
                background: 'var(--mp-bg)',
                border: '1px solid var(--mp-border)'
              }}
              data-active-style={{
                background: 'linear-gradient(0deg, rgba(79, 139, 253, 0.12), rgba(79, 139, 253, 0.12))',
                borderColor: 'rgba(79, 139, 253, 0.35)',
                color: 'var(--mp-accent)'
              }}
            >
              <Briefcase className="w-4 h-4" />
              <span className="whitespace-nowrap">Pet Services</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pupbox" 
              className="tab not-first:ml-1 px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-full transition-all duration-200 focus-visible:!ring-0 focus-visible:!ring-offset-0"
              style={{ 
                color: 'var(--mp-accent)', 
                background: 'var(--mp-bg)',
                border: '1px solid var(--mp-border)'
              }}
            >
              <Gift className="w-4 h-4" />
              <span className="whitespace-nowrap">Pup Box</span>
            </TabsTrigger>
            <TabsTrigger 
              value="store" 
              className="tab not-first:ml-1 px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-full transition-all duration-200 focus-visible:!ring-0 focus-visible:!ring-offset-0"
              style={{ 
                color: 'var(--mp-accent)', 
                background: 'var(--mp-bg)',
                border: '1px solid var(--mp-border)'
              }}
            >
              <Store className="w-4 h-4" />
              <span className="whitespace-nowrap">Store</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <ServicesTab />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <AdBanner targetPage="marketplace" format="sponsored" />
              <AdBanner targetPage="marketplace" format="sponsored" />
            </div>
          </TabsContent>

          <TabsContent value="pupbox" className="space-y-6">
            <PupBoxSubscription />
          </TabsContent>

          <TabsContent value="store" className="space-y-6">
            <StoreTab />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Cart FAB - shows on all marketplace tabs */}
      <CartFab />
    </div>
  );
};

export default Marketplace;
