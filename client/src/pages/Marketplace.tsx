
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Users, Briefcase } from 'lucide-react';
import ServicesMarketplace from '@/components/services/ServicesMarketplace';
import PupBoxSubscription from '@/components/subscriptions/PupBoxSubscription';
import AdBanner from '@/components/advertising/AdBanner';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('services');

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
            <TabsTrigger 
              value="store" 
              className="flex items-center space-x-2 font-medium transition-all duration-200"
              style={{
                backgroundColor: activeTab === 'store' ? '#2363FF' : 'transparent',
                color: activeTab === 'store' ? 'white' : '#2363FF'
              }}
            >
              <Users className="w-4 h-4" />
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
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Users className="h-12 w-12 text-blue-600 mx-auto" />
                  <h3 className="text-2xl font-bold text-gray-900">Pet Store</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Browse premium pet supplies, toys, food, and accessories for your furry friends.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Gift className="h-6 w-6 text-blue-600" />
                        </div>
                        <h4 className="font-semibold">Premium Toys</h4>
                        <p className="text-sm text-gray-600 mt-1">Durable and safe toys for all breeds</p>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Briefcase className="h-6 w-6 text-green-600" />
                        </div>
                        <h4 className="font-semibold">Health & Nutrition</h4>
                        <p className="text-sm text-gray-600 mt-1">Premium food and supplements</p>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <h4 className="font-semibold">Accessories</h4>
                        <p className="text-sm text-gray-600 mt-1">Collars, leashes, and grooming tools</p>
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Marketplace;
