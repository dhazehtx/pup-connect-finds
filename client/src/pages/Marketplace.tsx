
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="marketplace space-y-8">
          <div className="flex justify-center">
            <TabsList className="tab-group">
              <TabsTrigger 
                value="services"
                data-testid="tab-pet-services"
                className="tab-pill gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Pet Services</span>
                <span className="sm:hidden">Services</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pupbox"
                data-testid="tab-pup-box"
                className="tab-pill gap-2"
              >
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Pup Box</span>
                <span className="sm:hidden">Box</span>
              </TabsTrigger>
              <TabsTrigger 
                value="store"
                data-testid="tab-store"
                className="tab-pill gap-2"
              >
                <Store className="w-4 h-4" />
                <span>Store</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="services" className="mt-8 space-y-6 focus-visible:outline-none">
            <ServicesTab />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <AdBanner targetPage="marketplace" format="sponsored" />
              <AdBanner targetPage="marketplace" format="sponsored" />
            </div>
          </TabsContent>

          <TabsContent value="pupbox" className="mt-8 space-y-6 focus-visible:outline-none">
            <PupBoxSubscription />
          </TabsContent>

          <TabsContent value="store" className="mt-8 space-y-6 focus-visible:outline-none">
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
