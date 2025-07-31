import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, Crown, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePayments } from '@/hooks/usePayments';

const SubscriptionSuccess = () => {
  const [location, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string>('');
  const { user } = useAuth();
  const { getSubscriptionStatus } = usePayments();

  useEffect(() => {
    // Extract session_id from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session_id');
    if (id) {
      setSessionId(id);
    }

    // Refresh subscription status
    if (user) {
      getSubscriptionStatus();
    }
  }, [user, getSubscriptionStatus]);

  const handleContinue = () => {
    setLocation('/marketplace');
  };

  const handleViewProfile = () => {
    setLocation('/profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-gray-600">
            <p className="mb-2">Thank you for your subscription!</p>
            <p className="text-sm">Your payment has been processed successfully.</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <Gift className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm font-medium text-gray-800">
              Your premium features are now active!
            </p>
            <p className="text-xs text-gray-600 mt-1">
              You can now enjoy all the benefits of your subscription.
            </p>
          </div>

          {sessionId && (
            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
              Session ID: {sessionId}
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Continue to Marketplace
            </Button>
            <Button 
              onClick={handleViewProfile}
              variant="outline"
              className="w-full"
            >
              View My Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;