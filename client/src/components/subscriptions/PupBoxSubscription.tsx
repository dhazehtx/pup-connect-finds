import React, { useState } from 'react';
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
    <div className="max-w-6xl mx-auto px-4 md:px-6 bg-white min-h-screen pb-24">
      {/* Hero Header */}
      <div className="text-center space-y-4 pt-8 pb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Gift className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Pup Box Subscription</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Monthly surprise boxes filled with toys, treats, and goodies for your furry friend</p>
        <p className="text-sm text-gray-500">Prefer a one-time box? Try it out before subscribing!</p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className="product-card"
          >
            {/* Badge positioned at top */}
            {plan.badge && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <span className="inline-flex items-center rounded-full bg-blue-600 text-white text-xs font-semibold px-3 py-1 shadow-md">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Icon/Visual Header */}
            <div className="product-card__image bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Gift className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            {/* Card Body */}
            <div className="product-card__body">
              <div className="text-center mb-4">
                <h3 className="product-card__title text-xl mb-2">{plan.name} Pup Box</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-sm text-gray-600">/month</span>
                </div>
                <p className="product-card__description text-center">{plan.description}</p>
              </div>

              {/* Features List */}
              <div className="space-y-2 mb-4 flex-1">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Select Plan Button */}
              <div className="product-card__actions">
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className="btn-pill btn-pill--primary w-full"
                  data-testid={`button-select-${plan.id}`}
                >
                  Select Plan
                </button>
              </div>
            </div>
          </div>
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
