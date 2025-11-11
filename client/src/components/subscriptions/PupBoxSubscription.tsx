import React, { useState } from 'react';
import { Gift, Truck, Shield, RotateCcw, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Pup Box Product Configuration
// TODO: Replace these with your actual Stripe Product IDs from your Stripe dashboard
const PUP_BOX_PRODUCTS = {
  small: {
    subscription: 'STRIPE_PRODUCT_ID_SMALL_SUBSCRIPTION', // Replace with actual Stripe product ID
    oneTime: 'STRIPE_PRODUCT_ID_SMALL_ONETIME', // Replace with actual Stripe product ID
  },
  medium: {
    subscription: 'STRIPE_PRODUCT_ID_MEDIUM_SUBSCRIPTION',
    oneTime: 'STRIPE_PRODUCT_ID_MEDIUM_ONETIME',
  },
  large: {
    subscription: 'STRIPE_PRODUCT_ID_LARGE_SUBSCRIPTION',
    oneTime: 'STRIPE_PRODUCT_ID_LARGE_ONETIME',
  },
};

// SOL:PUPBOX:START
const PupBoxSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Track billing type selection for each plan
  const [billingType, setBillingType] = useState<{
    small: 'subscription' | 'oneTime';
    medium: 'subscription' | 'oneTime';
    large: 'subscription' | 'oneTime';
  }>({
    small: 'subscription',
    medium: 'subscription',
    large: 'subscription'
  });

  const plans = [
    {
      id: 'small' as const,
      name: 'Small',
      size: 'small',
      subscriptionPrice: 19.99,
      oneTimePrice: 23.99,
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
      id: 'medium' as const,
      name: 'Medium',
      size: 'medium',
      subscriptionPrice: 29.99,
      oneTimePrice: 35.99,
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
      id: 'large' as const,
      name: 'Large',
      size: 'large',
      subscriptionPrice: 39.99,
      oneTimePrice: 47.99,
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

  // Create checkout session mutation (same as Store tab)
  const checkoutMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast({
        title: "Checkout Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSelectPlan = (planId: 'small' | 'medium' | 'large') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      return;
    }

    // Get the selected billing type for this plan
    const selectedBillingType = billingType[planId];
    const productId = PUP_BOX_PRODUCTS[planId][selectedBillingType];

    // Start checkout with the selected product
    checkoutMutation.mutate(productId);
  };

  const handleToggleBillingType = (planId: 'small' | 'medium' | 'large', type: 'subscription' | 'oneTime') => {
    setBillingType(prev => ({
      ...prev,
      [planId]: type
    }));
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#f9f7f3' }}>
      {/* Hero Header with Gradient and Animated Halo */}
      <div className="relative bg-gradient-blue-violet text-white pt-14 pb-20 mb-10 overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        
        {/* Animated Halo Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '60px' }}>
          <div className="pup-box-halo"></div>
        </div>
        
        <div className="relative text-center space-y-5 max-w-4xl mx-auto px-6 md:px-8">
          {/* Icon with animated glow */}
          <div className="flex items-center justify-center mb-5">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/40 pup-box-icon-container">
              <Gift className="w-12 h-12 text-white drop-shadow-2xl" />
            </div>
          </div>
          
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-lg">Pup Box Subscription</h1>
          
          {/* Main Subheading */}
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto font-semibold">
            Curated toys, treats, and essentials delivered for your pup every month.
          </p>
          
          {/* Secondary helper text */}
          <p className="text-base md:text-lg text-white/85 max-w-2xl mx-auto">
            Pick your size, choose monthly or one-time, and we'll handle the rest.
          </p>
        </div>
      </div>

      {/* Background Section for Plans & Benefits */}
      <div className="pupbox-section">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Helper Text */}
          <div className="text-center mb-8">
            <p className="text-base text-gray-700 max-w-2xl mx-auto">
              Choose <span className="font-semibold text-primary-600">Subscribe</span> or <span className="font-semibold text-primary-600">One-Time</span> on each box before selecting your plan.
            </p>
          </div>
          
          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`product-card ${plan.id === 'medium' ? 'pupbox-card--featured' : ''}`}
              >
                {/* Badge positioned at top */}
                {plan.badge && (
                  <div className="pupbox-badge">
                    <span className="inline-flex items-center rounded-full bg-primary-600 text-white text-xs font-semibold px-3 py-1 shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Icon/Visual Header - Royal blue to violet gradient with subtle pattern */}
                <div className="product-card__image bg-gradient-blue-violet flex items-center justify-center relative overflow-hidden">
                  {/* Subtle abstract pattern using layered gradients */}
                  <div className="absolute inset-0 pup-box-card-pattern"></div>
                  
                  <div className="relative w-32 h-32 bg-white/25 backdrop-blur-sm rounded-full shadow-2xl flex items-center justify-center border-4 border-white/40 pup-box-card-icon">
                    <Gift className="w-16 h-16 text-white drop-shadow-2xl" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="product-card__body">
                  <div className="text-center mb-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{plan.name} Pup Box</h3>
                    
                    {/* Billing Type Toggle */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="inline-flex rounded-full bg-white border-2 border-gray-200 p-1 shadow-sm">
                        <button
                          onClick={() => handleToggleBillingType(plan.id, 'subscription')}
                          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                            billingType[plan.id] === 'subscription'
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-transparent text-primary-600 hover:bg-primary-50'
                          }`}
                          data-testid={`toggle-subscription-${plan.id}`}
                        >
                          Subscribe
                        </button>
                        <button
                          onClick={() => handleToggleBillingType(plan.id, 'oneTime')}
                          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                            billingType[plan.id] === 'oneTime'
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-transparent text-primary-600 hover:bg-primary-50'
                          }`}
                          data-testid={`toggle-onetime-${plan.id}`}
                        >
                          One-Time
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Price Display */}
                    <div className="mt-1 mb-3">
                      {billingType[plan.id] === 'subscription' ? (
                        <>
                          <div>
                            <span className="text-3xl font-bold text-primary-600">
                              ${plan.subscriptionPrice.toFixed(2)}
                            </span>
                            <span className="text-base font-medium" style={{ color: '#555555' }}>&nbsp;/ month</span>
                          </div>
                          <p className="text-xs mt-2" style={{ color: '#888888' }}>
                            Cancel anytime, skip or pause deliveries
                          </p>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-3xl font-bold text-primary-600">
                              ${plan.oneTimePrice.toFixed(2)}
                            </span>
                            <span className="text-base font-medium" style={{ color: '#555555' }}>&nbsp;one-time</span>
                          </div>
                          <p className="text-xs mt-2" style={{ color: '#888888' }}>
                            Try it out before subscribing
                          </p>
                        </>
                      )}
                    </div>
                    
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: '#555555' }}>{plan.description}</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 mb-4 flex-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm" style={{ color: '#555555' }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Select Plan Button */}
                  <div className="product-card__actions">
                    <button
                      onClick={() => handleSelectPlan(plan.id as 'small' | 'medium' | 'large')}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-4 pb-6">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg motion-safe:hover:shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Truck className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Free Shipping</h4>
                  <p className="text-sm" style={{ color: '#555555' }}>Delivered right to your door at no extra cost</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg motion-safe:hover:shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Quality Guaranteed</h4>
                  <p className="text-sm" style={{ color: '#555555' }}>30-day money-back guarantee on all boxes</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg motion-safe:hover:shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Cancel Anytime</h4>
                  <p className="text-sm" style={{ color: '#555555' }}>Skip, pause, or cancel your subscription anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
// SOL:PUPBOX:END

export default PupBoxSubscription;
