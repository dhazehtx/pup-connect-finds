
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Users, Briefcase } from 'lucide-react';
import ServicesMarketplace from '@/components/services/ServicesMarketplace';
import PupBoxSubscription from '@/components/subscriptions/PupBoxSubscription';
import AdBanner from '@/components/advertising/AdBanner';
import PuppyMarketplace from '@/components/marketplace/PuppyMarketplace';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('puppies');

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
              value="puppies" 
              className="flex items-center space-x-2 font-medium transition-all duration-200"
              style={{
                backgroundColor: activeTab === 'puppies' ? '#2363FF' : 'transparent',
                color: activeTab === 'puppies' ? 'white' : '#2363FF'
              }}
            >
              <Users className="w-4 h-4" />
              <span>Puppies</span>
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="flex items-center space-x-2 font-medium transition-all duration-200"
              style={{
                backgroundColor: activeTab === 'services' ? '#2363FF' : 'transparent',
                color: activeTab === 'services' ? 'white' : '#2363FF'
              }}
            >
              <Briefcase className="w-4 h-4" />
              <span>Pet Services</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pupbox" 
              className="flex items-center space-x-2 font-medium transition-all duration-200"
              style={{
                backgroundColor: activeTab === 'pupbox' ? '#2363FF' : 'transparent',
                color: activeTab === 'pupbox' ? 'white' : '#2363FF'
              }}
            >
              <Gift className="w-4 h-4" />
              <span>Pup Box</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="puppies" className="space-y-6">
            {/* Puppy listings spotlight ads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <AdBanner targetPage="marketplace" format="sponsored" />
              <AdBanner targetPage="marketplace" format="sponsored" />
            </div>
            
            <PuppyMarketplace />
          </TabsContent>

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
        </Tabs>
      </div>
    </div>
  );
};

export default Marketplace;
