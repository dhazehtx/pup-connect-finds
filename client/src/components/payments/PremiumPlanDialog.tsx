import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Shield, Users, MessageCircle } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PremiumPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumPlanDialog: React.FC<PremiumPlanDialogProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const { processing, subscriptionStatus, getSubscriptionStatus } = usePayments();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      getSubscriptionStatus();
    }
  }, [user, isOpen]);

  const plans = {
    monthly: {
      id: 'price_premium_monthly',
      name: 'Premium Monthly',
      price: 29.99,
      period: '/month',
      description: 'Perfect for trying premium features',
    },
    yearly: {
      id: 'price_premium_yearly', 
      name: 'Premium Yearly',
      price: 299.99,
      period: '/year',
      description: 'Save 2 months with annual billing',
      savings: 'Save $59.88',
    },
  };

  const features = [
    {
      icon: <Crown className="w-5 h-5 text-yellow-500" />,
      title: 'Priority Listings',
      description: 'Your listings appear at the top of search results',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      title: 'Advanced AI Insights',
      description: 'Get detailed breed analysis and health assessments',
    },
    {
      icon: <Shield className="w-5 h-5 text-green-500" />,
      title: 'Verified Badge',
      description: 'Build trust with a premium verification badge',
    },
    {
      icon: <Users className="w-5 h-5 text-blue-500" />,
      title: 'Unlimited Listings',
      description: 'Post as many dogs as you want without limits',
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-indigo-500" />,
      title: 'Priority Support',
      description: '24/7 premium customer support access',
    },
  ];

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe to Premium",
        variant: "destructive",
      });
      return;
    }

    if (subscriptionStatus?.hasActiveSubscription) {
      toast({
        title: "Already Subscribed",
        description: "You already have an active premium subscription",
      });
      return;
    }

    // Import the usePayments hook
    const { usePayments } = await import('@/hooks/usePayments');
    const { createSubscriptionCheckout } = usePayments();

    // Redirect to Stripe Checkout
    await createSubscriptionCheckout({
      productType: 'premium',
      priceId: plans[selectedPlan].id,
      trialDays: 14 // Premium comes with 14-day trial
    });
  };

  const currentPlan = plans[selectedPlan];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
        </DialogHeader>

        {subscriptionStatus?.hasActiveSubscription ? (
          <div className="text-center py-8">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">You're already Premium!</h3>
            <p className="text-gray-600">Enjoy all the premium features you've unlocked.</p>
            <Button onClick={onClose} className="mt-4">
              Got it
            </Button>
          </div>
        ) : (
          <>
            {/* Plan Selection */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card
                className={`p-4 cursor-pointer border-2 transition-colors ${
                  selectedPlan === 'monthly' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan('monthly')}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{plans.monthly.name}</h3>
                    <p className="text-sm text-gray-600">{plans.monthly.description}</p>
                    <div className="text-2xl font-bold mt-2">
                      ${plans.monthly.price}
                      <span className="text-sm font-normal text-gray-600">/month</span>
                    </div>
                  </div>
                  {selectedPlan === 'monthly' && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer border-2 transition-colors relative ${
                  selectedPlan === 'yearly'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan('yearly')}
              >
                <Badge className="absolute -top-2 left-4 bg-green-500">
                  Popular
                </Badge>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{plans.yearly.name}</h3>
                    <p className="text-sm text-gray-600">{plans.yearly.description}</p>
                    <div className="text-2xl font-bold mt-2">
                      ${plans.yearly.price}
                      <span className="text-sm font-normal text-gray-600">/year</span>
                    </div>
                    <p className="text-sm text-green-600 font-medium">{plans.yearly.savings}</p>
                  </div>
                  {selectedPlan === 'yearly' && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </Card>
            </div>

            {/* Features List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Premium Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {feature.icon}
                    <div>
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubscribe}
                disabled={processing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {processing ? 'Processing...' : `Subscribe for ${currentPlan.price}${currentPlan.period}`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PremiumPlanDialog;