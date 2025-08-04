
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto rounded-lg overflow-hidden shadow-sm" style={{ backgroundColor: '#E5EEFF', border: '2px solid #CBD5E1' }}>
            <TabsTrigger 
              value="services" 
              className={`flex items-center space-x-2 font-medium transition-all duration-200 ${
                activeTab === 'services' ? 'bg-primary-600 text-white' : 'bg-transparent text-primary-600'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Pet Services</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pupbox" 
              className={`flex items-center space-x-2 font-medium transition-all duration-200 ${
                activeTab === 'pupbox' ? 'bg-primary-600 text-white' : 'bg-transparent text-primary-600'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Pup Box</span>
            </TabsTrigger>
            <TabsTrigger 
              value="store" 
              className={`flex items-center space-x-2 font-medium transition-all duration-200 ${
                activeTab === 'store' ? 'bg-primary-600 text-white' : 'bg-transparent text-primary-600'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Store</span>
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
