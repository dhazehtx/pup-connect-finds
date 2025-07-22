
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Star, Settings, Share } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import UnifiedProfileView from '@/components/profile/UnifiedProfileView';

const ProfileWithFreemium = () => {
  const { user } = useAuth();
  const { subscribed, subscription_tier, createCheckout } = useSubscription();
  
  const isPremium = subscribed && (subscription_tier === 'Pro' || subscription_tier === 'Enterprise');

  const handleUpgrade = () => {
    createCheckout('Pro');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Upgrade Section for Current User */}
      {user && !isPremium && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <div className="container mx-auto px-4 py-6">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="w-8 h-8 text-white mr-2" />
                  <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
                </div>
                <p className="text-white/90 mb-6">
                  Unlock unlimited breeder contacts, early puppy alerts, and exclusive features
                </p>
                <div className="flex items-center justify-center space-x-6 mb-6 text-sm">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Early Access
                  </div>
                  <div className="flex items-center">
                    <Crown className="w-4 h-4 mr-1" />
                    Premium Badge
                  </div>
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-1" />
                    Priority Support
                  </div>
                </div>
                <Button 
                  onClick={handleUpgrade}
                  className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8"
                >
                  Start Free Trial - $14.99/month
                </Button>
                <p className="text-white/70 text-xs mt-2">14-day free trial • Cancel anytime</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Premium Badge for Premium Users */}
      {isPremium && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center">
              <Crown className="w-5 h-5 mr-2" />
              <span className="font-medium">Premium Member</span>
              <Badge className="ml-3 bg-white/20 text-white border-white/20">
                {subscription_tier}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <UnifiedProfileView userId={user?.id} isCurrentUser={true} />
    </div>
  );
};

export default ProfileWithFreemium;
