import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isFeatureHidden, EARLY_ACCESS_CONFIG } from '@/config/earlyAccess';

const PremiumUpgradePrompt = () => {
  // Hide premium upgrade prompts during early access
  if (isFeatureHidden('subscriptionTiers')) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Crown className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Premium Features Unlocked</h3>
                <p className="text-sm text-gray-600">{EARLY_ACCESS_CONFIG.messages.freeDuringEarlyAccess}</p>
              </div>
            </div>
            <div className="flex items-center text-green-600">
              <Shield className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Free Access</span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <Star className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">All Features</p>
            </div>
            <div className="text-center">
              <Shield className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">No Limits</p>
            </div>
            <div className="text-center">
              <Zap className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Full Access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Keep original premium upgrade prompt for when early access is disabled
  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-yellow-100">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Upgrade to Premium</h3>
              <p className="text-sm text-gray-600">Unlock exclusive features and benefits</p>
            </div>
          </div>
          <Link to="/premium-dashboard">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </Link>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Priority Support</p>
          </div>
          <div className="text-center">
            <Shield className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Advanced Security</p>
          </div>
          <div className="text-center">
            <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Premium Features</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumUpgradePrompt;
