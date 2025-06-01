
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Crown, 
  Zap, 
  Shield, 
  Star, 
  Target,
  TrendingUp,
  MessageSquare,
  Calendar,
  Bell,
  Lock
} from 'lucide-react';

const PremiumFeatures = () => {
  const [features, setFeatures] = useState({
    featuredListings: true,
    prioritySupport: true,
    advancedAnalytics: true,
    autoPromotion: false,
    premiumBadge: true,
    bulkOperations: false
  });

  const premiumFeatures = [
    {
      id: 'featuredListings',
      title: 'Featured Listings',
      description: 'Get your listings highlighted at the top of search results',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      enabled: features.featuredListings
    },
    {
      id: 'prioritySupport',
      title: 'Priority Support',
      description: '24/7 dedicated support with faster response times',
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      enabled: features.prioritySupport
    },
    {
      id: 'advancedAnalytics',
      title: 'Advanced Analytics',
      description: 'Detailed insights on performance, audience, and revenue',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      enabled: features.advancedAnalytics
    },
    {
      id: 'autoPromotion',
      title: 'Auto-Promotion',
      description: 'Automatically promote listings across social media',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      enabled: features.autoPromotion
    },
    {
      id: 'premiumBadge',
      title: 'Premium Badge',
      description: 'Display verified premium breeder status',
      icon: Crown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      enabled: features.premiumBadge
    },
    {
      id: 'bulkOperations',
      title: 'Bulk Operations',
      description: 'Manage multiple listings at once efficiently',
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      enabled: features.bulkOperations
    }
  ];

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Premium Features
          </h2>
          <p className="text-gray-600">Unlock advanced tools and capabilities</p>
        </div>
        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
          PRO PLAN
        </Badge>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {premiumFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.id} className={`transition-all ${feature.enabled ? 'ring-2 ring-blue-200' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                      <Icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </div>
                  <Switch
                    checked={feature.enabled}
                    onCheckedChange={() => toggleFeature(feature.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                {feature.enabled && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">✓ Active</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">15</div>
              <div className="text-sm text-gray-600">Featured Listings</div>
              <div className="text-xs text-green-600">+3 from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">48</div>
              <div className="text-sm text-gray-600">Priority Support Tickets</div>
              <div className="text-xs text-blue-600">Avg response: 2.3 hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">127</div>
              <div className="text-sm text-gray-600">Analytics Reports Generated</div>
              <div className="text-xs text-green-600">Daily insights available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Contact Premium Support</h3>
                <p className="text-sm text-gray-600">Get help from our premium support team</p>
              </div>
            </div>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Schedule Consultation</h3>
                <p className="text-sm text-gray-600">Book a 1-on-1 strategy session</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">Book Now</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PremiumFeatures;
