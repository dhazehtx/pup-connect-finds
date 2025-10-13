import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Truck, Shield, RotateCcw, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePayments } from '@/hooks/usePayments';
import StripeCheckout from '@/components/checkout/StripeCheckout';

// SOL:PUPBOX:START
const PupBoxSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createSubscriptionCheckout, createPaymentIntent, processing } = usePayments();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);

  const plans = [
    {
      id: 'small',
      name: 'Small',
      size: 'small',
      price: 19.99,
      description: 'Great for pups under 25 lbs',
      features: [
        '3-4 premium toys',
        '2-3 healthy treats',
        '1 grooming essential',
        'Free shipping included'
      ],
      badge: 'Most Popular',
      badgeColor: 'blue'
    },
    {
      id: 'medium',
      name: 'Medium',
      size: 'medium', 
      price: 29.99,
      description: 'Perfect for dogs 25-65 lbs',
      features: [
        '4-5 premium toys',
        '3-4 healthy treats',
        '1-2 grooming essentials',
        'Free shipping included'
      ],
      badge: null,
      badgeColor: null
    },
    {
      id: 'large',
      name: 'Large',
      size: 'large',
      price: 39.99,
      description: 'Ideal for dogs over 65 lbs',
      features: [
        '5-6 premium toys',
        '4-5 healthy treats',
        '2 grooming essentials',
        'Free shipping included'
      ],
      badge: 'Best Value',
      badgeColor: 'blue'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    setCheckoutPlan({
      name: `${plan.name} Pup Box`,
      price: plan.price,
      features: plan.features,
      popular: plan.badge === 'Most Popular',
      purchaseType: 'subscription'
    });
    setShowCheckout(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      {/* Hero Header */}
      <div className="text-center space-y-3 pt-6 pb-6 md:pb-8">
        <div className="flex items-center justify-center">
          <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full">
            <Gift className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Pup Box Subscription</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Monthly surprise boxes filled with premium toys, treats, and goodies for your furry friend</p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition flex flex-col"
          >
            <CardHeader className="space-y-4">
              {/* Badge */}
              {plan.badge && (
                <div className="flex justify-center">
                  <span className="inline-flex items-center rounded-full bg-blue-600/10 text-blue-700 text-xs font-medium px-2.5 py-1">
                    {plan.badge}
                  </span>
                </div>
              )}
              
              {/* Plan Title & Price */}
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold tracking-tight text-gray-900">${plan.price}</span>
                  <span className="text-sm text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 grow">
              {/* Select Plan Button */}
              <Button 
                onClick={() => handleSelectPlan(plan.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                data-testid={`button-select-${plan.id}`}
              >
                Select plan
              </Button>

              {/* Features List */}
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-6 md:pt-8 pb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 mb-1">Free Shipping</h4>
              <p className="text-sm text-gray-700">Delivered right to your door at no extra cost</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 mb-1">Quality Guaranteed</h4>
              <p className="text-sm text-gray-700">30-day money-back guarantee on all boxes</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <RotateCcw className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 mb-1">Cancel Anytime</h4>
              <p className="text-sm text-gray-700">Skip, pause, or cancel your subscription anytime</p>
            </div>
          </div>
        </div>
      </div>

      <StripeCheckout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        productType="pupbox"
        planDetails={checkoutPlan}
      />
    </div>
  );
};
// SOL:PUPBOX:END

export default PupBoxSubscription;
