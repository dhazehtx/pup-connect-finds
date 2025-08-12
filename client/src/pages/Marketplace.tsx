
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Users, Briefcase, Store } from 'lucide-react';
import { Pill } from '@/components/Pill';
import ServicesMarketplace from '@/components/services/ServicesMarketplace';
import PupBoxSubscription from '@/components/subscriptions/PupBoxSubscription';
import StoreTab from './Marketplace/StoreTab';
import { ServicesTab } from './Services/ServicesTab';
import AdBanner from '@/components/advertising/AdBanner';
import CartFab from '@/components/ui/CartFab';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('services');

  const TABS = [
    { key: 'services', label: 'Pet Services', icon: <Briefcase className="w-4 h-4" />, component: <ServicesTab /> },
    { key: 'pupbox', label: 'Pup Box', icon: <Gift className="w-4 h-4" />, component: <PupBoxSubscription /> },
    { key: 'store', label: 'Store', icon: <Store className="w-4 h-4" />, component: <StoreTab /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Ad Banner */}
      <div className="container mx-auto px-4 py-6">
        <AdBanner targetPage="marketplace" format="banner" className="mb-6" />
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Top Tab Pills */}
        <div className="flex gap-3 justify-center mb-6">
          {TABS.map(tab => (
            <Pill
              key={tab.key}
              label={tab.label}
              icon={tab.icon}
              selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="marketplace space-y-6">

          <TabsContent value="services" className="space-y-6">
            <ServicesTab />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <AdBanner targetPage="marketplace" format="sponsored" />
              <AdBanner targetPage="marketplace" format="sponsored" />
            </div>
            
            <ServicesMarketplace />
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
