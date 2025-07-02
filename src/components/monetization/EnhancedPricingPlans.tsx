
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StripeCheckout from '@/components/checkout/StripeCheckout';

const EnhancedPricingPlans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const { user } = useAuth();
  
  const plans = [
    {
      name: 'Pup Seeker',
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      popular: false,
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        'Browse available puppies',
        'Basic search filters',
        'Contact 3 breeders per month',
        'Save up to 5 favorites',
        'Community access'
      ]
    },
    {
      name: 'Pup Pro',
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      popular: true,
      monthlyPrice: 14.99,
      yearlyPrice: 149.99,
      features: [
        'Everything in Pup Seeker',
        'Unlimited breeder contacts',
        'Early access to new puppies',
        'Smart puppy matchmaker',
        'Premium educational content',
        'Verified premium badge',
        'Priority customer support',
        '14-day free trial'
      ]
    },
    {
      name: 'Pup Partner',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      popular: false,
      monthlyPrice: 39.99,
      yearlyPrice: 399.99,
      features: [
        'Everything in Pup Pro',
        'Business listing features',
        'Advanced analytics dashboard',
        'Marketing tools & insights',
        'Breeder verification badge',
        'Featured listing placement',
        'Dedicated account manager',
        'Custom branding options'
      ]
    }
  ];

  const savings = (plan: any) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    if (monthlyCost === 0) return 0;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  const handleSubscribe = (plan: any) => {
    if (plan.monthlyPrice === 0) {
      // Handle free plan
      return;
    }

    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    setSelectedPlan({
      name: plan.name,
      price: price,
      features: plan.features,
      popular: plan.popular
    });
    setShowCheckout(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 mb-6">Find the perfect plan for your puppy search journey</p>
        
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${!isYearly ? 'font-semibold' : 'text-gray-600'}`}>Monthly</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`text-sm ${isYearly ? 'font-semibold' : 'text-gray-600'}`}>
            Yearly
            <Badge className="ml-2 bg-green-100 text-green-800">Save up to 17%</Badge>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const period = isYearly ? 'year' : 'month';
          
          return (
            <Card 
              key={index} 
              className={`relative ${plan.borderColor} ${
                plan.popular ? 'ring-2 ring-yellow-400 scale-105' : ''
              } transition-all hover:shadow-lg`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.bgColor}`}>
                <div className="flex justify-center mb-2">
                  <Icon size={32} className={plan.color} />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {price === 0 ? (
                    'Free'
                  ) : (
                    <>
                      ${price}
                      <span className="text-base font-normal text-gray-600">/{period}</span>
                    </>
                  )}
                </div>
                {isYearly && plan.monthlyPrice > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    Save {savings(plan)}% annually
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="p-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSubscribe(plan)}
                  disabled={!user && plan.monthlyPrice > 0}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : plan.monthlyPrice === 0
                        ? 'bg-gray-500 hover:bg-gray-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                  } text-white font-semibold`}
                >
                  {plan.monthlyPrice === 0 ? (
                    'Current Plan'
                  ) : !user ? (
                    'Sign in to Subscribe'
                  ) : (
                    'Get Started'
                  )}
                </Button>
                
                {plan.name === 'Pup Pro' && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    14-day free trial • Cancel anytime
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Card className="inline-block">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Need help choosing?</h3>
            <p className="text-gray-600 mb-4">Contact our team for personalized recommendations.</p>
            <Button variant="outline">Contact Support</Button>
          </CardContent>
        </Card>
      </div>

      {/* Stripe Checkout Modal */}
      <StripeCheckout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        productType="premium"
        planDetails={selectedPlan}
      />
    </div>
  );
};

export default EnhancedPricingPlans;
