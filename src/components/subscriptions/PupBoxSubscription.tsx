import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Gift, Truck, Calendar, Star, ShoppingCart, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import StripeCheckout from '@/components/checkout/StripeCheckout';

const PupBoxSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [purchaseTypes, setPurchaseTypes] = useState<{[key: string]: 'subscription' | 'one-time'}>({
    small: 'subscription',
    medium: 'subscription',
    large: 'subscription'
  });

  const plans = [
    {
      id: 'small',
      name: 'Small Pup Box',
      size: 'small',
      subscriptionPrice: 19.99,
      oneTimePrice: 24.99,
      description: 'Perfect for dogs under 25 lbs',
      items: '3-4 toys, 2-3 treats, 1 grooming item',
      badge: 'Most Popular'
    },
    {
      id: 'medium',
      name: 'Medium Pup Box',
      size: 'medium', 
      subscriptionPrice: 29.99,
      oneTimePrice: 34.99,
      description: 'Great for dogs 25-65 lbs',
      items: '4-5 toys, 3-4 treats, 1-2 grooming items',
      badge: null
    },
    {
      id: 'large',
      name: 'Large Pup Box',
      size: 'large',
      subscriptionPrice: 39.99,
      oneTimePrice: 44.99,
      description: 'Ideal for dogs over 65 lbs',
      items: '5-6 toys, 4-5 treats, 2 grooming items',
      badge: 'Best Value'
    }
  ];

  const handlePurchaseTypeToggle = (planId: string) => {
    setPurchaseTypes(prev => ({
      ...prev,
      [planId]: prev[planId] === 'subscription' ? 'one-time' : 'subscription'
    }));
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    const purchaseType = purchaseTypes[plan.id];
    const price = purchaseType === 'subscription' ? plan.subscriptionPrice : plan.oneTimePrice;

    setCheckoutPlan({
      name: `${plan.name} ${purchaseType === 'subscription' ? 'Subscription' : 'One-Time Purchase'}`,
      price: price,
      features: [
        `${plan.items}`,
        'Hand-picked toys and treats by pet experts',
        'Always free shipping, right to your door',
        purchaseType === 'subscription' ? 'Skip, pause, or cancel anytime' : 'No commitment required'
      ],
      popular: plan.badge === 'Most Popular',
      purchaseType: purchaseType
    });
    setShowCheckout(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full">
            <Gift className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pup Box Subscription</h1>
        <p className="text-gray-600">Monthly surprise boxes filled with toys, treats, and goodies for your furry friend</p>
      </div>

      {/* One-time purchase intro */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-600 bg-purple-50 inline-block px-4 py-2 rounded-full">
          💡 Prefer a one-time box? Try it out before subscribing!
        </p>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const currentPurchaseType = purchaseTypes[plan.id];
          const currentPrice = currentPurchaseType === 'subscription' ? plan.subscriptionPrice : plan.oneTimePrice;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'ring-2 ring-purple-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader className="text-center">
                {plan.badge && (
                  <Badge className="bg-purple-500 text-white border-0 mb-2">
                    {plan.badge}
                  </Badge>
                )}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-purple-600">
                  ${currentPrice}
                  {currentPurchaseType === 'subscription' && <span className="text-base font-normal text-gray-600">/month</span>}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center">{plan.description}</p>
                
                {/* Polished Purchase Type Toggle */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="w-4 h-4 text-gray-700" />
                      <span className="text-sm font-semibold text-gray-800">Buy</span>
                    </div>
                    <Switch 
                      checked={currentPurchaseType === 'subscription'}
                      onCheckedChange={() => handlePurchaseTypeToggle(plan.id)}
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-800">Sub</span>
                      <RotateCcw className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-700 font-medium">
                      {currentPurchaseType === 'subscription' 
                        ? `$${plan.subscriptionPrice}/month • Cancel anytime`
                        : `$${plan.oneTimePrice} • No commitment`
                      }
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">What's included:</div>
                  <div className="text-sm text-gray-600">{plan.items}</div>
                </div>
                
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 mr-1" />
                    Free shipping
                  </div>
                  {currentPurchaseType === 'subscription' && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Cancel anytime
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlan && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Confirm Your Pup Box</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-6">You're almost there! Click below to complete your purchase.</p>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Order Summary</h4>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm">30-day money-back guarantee</span>
                  </div>
                </div>
                {(() => {
                  const plan = plans.find(p => p.id === selectedPlan);
                  const purchaseType = purchaseTypes[selectedPlan];
                  const price = purchaseType === 'subscription' ? plan?.subscriptionPrice : plan?.oneTimePrice;
                  return (
                    <>
                      <div className="text-sm text-gray-600">
                        {plan?.name} - ${price}{purchaseType === 'subscription' ? '/month' : ''}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {purchaseType === 'subscription' 
                          ? 'First delivery in 3-5 business days • Cancel anytime'
                          : 'One-time purchase • Delivery in 3-5 business days'
                        }
                      </div>
                    </>
                  );
                })()}
              </div>

              <Button 
                onClick={handleProceedToCheckout}
                disabled={!selectedPlan}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                size="lg"
              >
                {(() => {
                  const plan = plans.find(p => p.id === selectedPlan);
                  const purchaseType = purchaseTypes[selectedPlan];
                  const price = purchaseType === 'subscription' ? plan?.subscriptionPrice : plan?.oneTimePrice;
                  return purchaseType === 'subscription' 
                    ? 'Subscribe Now' 
                    : `Buy Once – $${price}`;
                })()}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-medium mb-2">Curated Selection</h3>
          <p className="text-sm text-gray-600">Hand-picked toys and treats by pet experts</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Truck className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-medium mb-2">Free Shipping</h3>
          <p className="text-sm text-gray-600">Always free shipping, right to your door</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-medium mb-2">Flexible</h3>
          <p className="text-sm text-gray-600">Skip, pause, or cancel anytime</p>
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      <StripeCheckout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        productType="pupbox"
        planDetails={checkoutPlan}
      />
    </div>
  );
};

export default PupBoxSubscription;
