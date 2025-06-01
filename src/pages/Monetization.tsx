
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Heart, Star, Users, CreditCard, BarChart3, Gift } from 'lucide-react';
import MonetizationDashboard from '@/components/monetization/MonetizationDashboard';
import EnhancedPricingPlans from '@/components/monetization/EnhancedPricingPlans';
import SubscriptionAnalytics from '@/components/monetization/SubscriptionAnalytics';
import ListingFees from '@/components/monetization/ListingFees';
import DonationCenter from '@/components/monetization/DonationCenter';
import DoggyBoxPromotion from '@/components/monetization/DoggyBoxPromotion';

const Monetization = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Center</h1>
          <p className="text-gray-600">Comprehensive revenue management and growth tools</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="max-w-7xl mx-auto">
        <div className="bg-white border-b sticky top-0 z-10">
          <TabsList className="grid w-full grid-cols-7 h-16">
            <TabsTrigger value="dashboard" className="flex flex-col items-center gap-1">
              <DollarSign size={18} />
              <span className="text-xs">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex flex-col items-center gap-1">
              <Users size={18} />
              <span className="text-xs">Subscriptions</span>
            </TabsTrigger>
            <TabsTrigger value="doggy-boxes" className="flex flex-col items-center gap-1">
              <Gift size={18} />
              <span className="text-xs">Doggy Boxes</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col items-center gap-1">
              <BarChart3 size={18} />
              <span className="text-xs">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex flex-col items-center gap-1">
              <Star size={18} />
              <span className="text-xs">Listing Fees</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex flex-col items-center gap-1">
              <CreditCard size={18} />
              <span className="text-xs">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex flex-col items-center gap-1">
              <Heart size={18} />
              <span className="text-xs">Donations</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="m-0">
          <div className="p-6 space-y-6">
            <DoggyBoxPromotion />
            <MonetizationDashboard />
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="m-0">
          <EnhancedPricingPlans />
        </TabsContent>

        <TabsContent value="doggy-boxes" className="m-0">
          <div className="p-6">
            <DoggyBoxPromotion />
            <div className="mt-8 text-center">
              <div className="text-center py-12">
                <Gift size={48} className="text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Doggy Subscription Management</h3>
                <p className="text-gray-600 mb-4">
                  Analytics and management tools for doggy subscription boxes coming soon!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="font-semibold mb-2">Monthly Revenue Tracking</h4>
                    <p className="text-sm text-gray-600">Monitor subscription box revenue and growth</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="font-semibold mb-2">Customer Preferences</h4>
                    <p className="text-sm text-gray-600">Analyze dog profiles and customization data</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="font-semibold mb-2">Inventory Management</h4>
                    <p className="text-sm text-gray-600">Track toys, treats, and accessories inventory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="m-0">
          <SubscriptionAnalytics />
        </TabsContent>

        <TabsContent value="listings" className="m-0">
          <ListingFees />
        </TabsContent>

        <TabsContent value="transactions" className="m-0">
          <div className="p-6">
            <div className="text-center py-12">
              <CreditCard size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transaction Management</h3>
              <p className="text-gray-600 mb-4">
                Secure payment processing with 8% transaction fee on all sales
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="font-semibold mb-2">Secure Escrow</h4>
                  <p className="text-sm text-gray-600">Protected payments until delivery confirmation</p>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="font-semibold mb-2">Instant Payouts</h4>
                  <p className="text-sm text-gray-600">Receive funds within 24 hours of sale</p>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="font-semibold mb-2">Dispute Protection</h4>
                  <p className="text-sm text-gray-600">Fair resolution for all transactions</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="donations" className="m-0">
          <DonationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Monetization;
