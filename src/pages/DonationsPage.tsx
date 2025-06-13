
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, DollarSign, Gift } from 'lucide-react';
import RescueDonationCenter from '@/components/donations/RescueDonationCenter';
import ShelterTipping from '@/components/donations/ShelterTipping';
import DonationCenter from '@/components/monetization/DonationCenter';

const DonationsPage = () => {
  const stats = [
    {
      icon: Heart,
      title: 'Dogs Helped',
      value: '15,643',
      description: 'Through community donations',
      color: 'text-red-600'
    },
    {
      icon: Users,
      title: 'Active Donors',
      value: '8,924',
      description: 'Supporting rescue efforts',
      color: 'text-blue-600'
    },
    {
      icon: DollarSign,
      title: 'Total Raised',
      value: '$284K',
      description: 'For rescue organizations',
      color: 'text-green-600'
    },
    {
      icon: Gift,
      title: 'Tips Sent',
      value: '2,156',
      description: 'To rescue heroes',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Heart size={64} className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Help Save Rescue Dogs</h1>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Every donation makes a difference. Support verified rescue organizations, 
            emergency relief efforts, and individual rescue heroes making a difference every day.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-lg">
                <CardContent className="p-6 text-center">
                  <Icon size={32} className={`${stat.color} mx-auto mb-3`} />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-700 mb-1">{stat.title}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <Tabs defaultValue="rescue-donations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="rescue-donations" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Rescue Donations
            </TabsTrigger>
            <TabsTrigger value="appreciation-tips" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Appreciation Tips
            </TabsTrigger>
            <TabsTrigger value="general-support" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              General Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rescue-donations">
            <RescueDonationCenter />
          </TabsContent>

          <TabsContent value="appreciation-tips">
            <ShelterTipping />
          </TabsContent>

          <TabsContent value="general-support">
            <DonationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DonationsPage;
