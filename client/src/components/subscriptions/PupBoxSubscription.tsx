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
  const [showPlanChoice, setShowPlanChoice] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large' | null>(null);

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

    // Show modal to choose between subscription and one-time
    setSelectedSize(planId);
    setShowPlanChoice(true);
  };

  const handlePurchaseChoice = (type: 'subscription' | 'oneTime') => {
    if (!selectedSize) return;

    const productId = PUP_BOX_PRODUCTS[selectedSize][type];

    // Close modal
    setShowPlanChoice(false);

    // Start checkout with the selected product
    checkoutMutation.mutate(productId);
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
              <span className="font-semibold text-primary-600">Click "Select Plan"</span> to choose between a monthly subscription or one-time gift at checkout.
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{plan.name} Pup Box</h3>
                    <div className="mt-1 mb-3">
                      <span className="text-3xl font-bold text-primary-600">
                        ${plan.price.toFixed(2)}
                      </span>
                      <span className="text-base font-medium" style={{ color: '#555555' }}>&nbsp;/ month</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: '#555555' }}>{plan.description}</p>
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

      {/* Purchase Choice Modal */}
      <Dialog open={showPlanChoice} onOpenChange={setShowPlanChoice}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary-600" />
              Choose Your Option
            </DialogTitle>
            <DialogDescription>
              {selectedSize && `${plans.find(p => p.id === selectedSize)?.name} Pup Box`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {/* Subscription Option */}
            <button
              onClick={() => handlePurchaseChoice('subscription')}
              disabled={checkoutMutation.isPending}
              className="w-full p-4 text-left rounded-xl border-2 border-primary-600 bg-primary-50 hover:bg-primary-100 transition-all duration-200 motion-safe:hover:scale-[1.02]"
              data-testid="button-subscribe-monthly"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Subscribe Monthly</p>
                  <p className="text-sm" style={{ color: '#555555' }}>
                    ${selectedSize && plans.find(p => p.id === selectedSize)?.price.toFixed(2)} / month
                  </p>
                </div>
                <div className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">
                  Best Value
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: '#555555' }}>Cancel anytime, skip or pause deliveries</p>
            </button>

            {/* One-Time Purchase Option */}
            <button
              onClick={() => handlePurchaseChoice('oneTime')}
              disabled={checkoutMutation.isPending}
              className="w-full p-4 text-left rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 motion-safe:hover:scale-[1.02]"
              data-testid="button-one-time"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">One-Time Box</p>
                  <p className="text-sm" style={{ color: '#555555' }}>
                    ${selectedSize && ((plans.find(p => p.id === selectedSize)?.price || 0) * 1.2).toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: '#555555' }}>Try it out before subscribing</p>
            </button>
          </div>

          {checkoutMutation.isPending && (
            <div className="text-center text-sm text-gray-600">
              Creating checkout session...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
// SOL:PUPBOX:END

export default PupBoxSubscription;
