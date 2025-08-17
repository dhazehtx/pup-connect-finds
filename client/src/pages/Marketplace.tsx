
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
            <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground grid w-full max-w-md grid-cols-3">
              <TabsTrigger 
                value="services"
                data-testid="tab-pet-services"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Pet Services</span>
                <span className="sm:hidden">Services</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pupbox"
                data-testid="tab-pup-box"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow gap-2"
              >
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Pup Box</span>
                <span className="sm:hidden">Box</span>
              </TabsTrigger>
              <TabsTrigger 
                value="store"
                data-testid="tab-store"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow gap-2"
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
