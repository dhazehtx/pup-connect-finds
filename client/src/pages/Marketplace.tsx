
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Users, Briefcase, Store } from 'lucide-react';
import ServicesMarketplace from '@/components/services/ServicesMarketplace';
import PupBoxSubscription from '@/components/subscriptions/PupBoxSubscription';
import StoreTab from './Marketplace/StoreTab';
import AdBanner from '@/components/advertising/AdBanner';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('services');

  const tabs = [
    { key: 'services', label: 'Pet Services', component: <ServicesMarketplace /> },
    { key: 'pupbox', label: 'Pup Box', component: <PupBoxSubscription /> },
    { key: 'store', label: 'Store', component: <StoreTab /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Ad Banner */}
      <div className="container mx-auto px-4 py-6">
        <AdBanner targetPage="marketplace" format="banner" className="mb-6" />
      </div>

      <div className="container mx-auto px-4 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="marketplace space-y-6">
          <TabsList className="inline-flex rounded-full border-2 border-gray-300 bg-[#E5EEFF] p-1 gap-1 max-w-lg mx-auto">
            <TabsTrigger 
              value="services" 
              className="px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-full transition-all duration-200 text-primary-600 data-[state=active]:text-white data-[state=active]:bg-primary-600"
            >
              <Briefcase className="w-4 h-4" />
              <span className="whitespace-nowrap">Pet Services</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pupbox" 
              className="px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-full transition-all duration-200 text-primary-600 data-[state=active]:text-white data-[state=active]:bg-primary-600"
            >
              <Gift className="w-4 h-4" />
              <span className="whitespace-nowrap">Pup Box</span>
            </TabsTrigger>
            <TabsTrigger 
              value="store" 
              className="px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-full transition-all duration-200 text-primary-600 data-[state=active]:text-white data-[state=active]:bg-primary-600"
            >
              <Store className="w-4 h-4" />
              <span className="whitespace-nowrap">Store</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            {/* Services spotlight ads */}
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
    </div>
  );
};

export default Marketplace;
