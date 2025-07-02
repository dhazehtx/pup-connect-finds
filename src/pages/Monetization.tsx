
import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedPricingPlans from '@/components/monetization/EnhancedPricingPlans';
import SubscriptionAnalytics from '@/components/monetization/SubscriptionAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, BarChart3, TrendingUp } from 'lucide-react';
import { isFeatureHidden } from '@/config/earlyAccess';
import EarlyAccessBanner from '@/components/common/EarlyAccessBanner';

const Monetization = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EarlyAccessBanner />
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {isFeatureHidden('subscriptionTiers') ? 'Premium Features' : 'Unlock Premium Features'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isFeatureHidden('subscriptionTiers') 
                ? 'All premium features are available during early access'
                : 'Choose the perfect plan for your pet business or upgrade your browsing experience'
              }
            </p>
          </div>

          <Tabs defaultValue="pricing" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                {isFeatureHidden('subscriptionTiers') ? 'Features' : 'Pricing Plans'}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Business Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pricing">
              <EnhancedPricingPlans />
            </TabsContent>

            <TabsContent value="analytics">
              {user ? (
                <SubscriptionAnalytics />
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-4">Sign in to view analytics</h3>
                  <p className="text-gray-600">
                    Analytics are available for all users
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">Business Insights Coming Soon</h3>
                <p className="text-gray-600">
                  Advanced business intelligence and market trends will be available here
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Monetization;
