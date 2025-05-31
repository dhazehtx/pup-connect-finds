
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Crown, Star, Zap, Settings } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';

const PricingPlans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { subscribed, subscription_tier, createCheckout, openCustomerPortal, loading } = useSubscription();
  const { user } = useAuth();
  
  const plans = [
    {
      name: 'Basic',
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      popular: false,
      monthlyPrice: 7.99,
      yearlyPrice: 79.99,
      features: [
        'Up to 5 dog listings',
        'Basic messaging',
        'Standard support',
        'Basic analytics'
      ]
    },
    {
      name: 'Pro',
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      popular: true,
      monthlyPrice: 14.99,
      yearlyPrice: 149.99,
      features: [
        'Unlimited dog listings',
        'Priority messaging',
        'Advanced search filters',
        'Detailed analytics',
        'Verification badge',
        'Priority support'
      ]
    },
    {
      name: 'Enterprise',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      popular: false,
      monthlyPrice: 29.99,
      yearlyPrice: 299.99,
      features: [
        'Everything in Pro',
        'Custom branding',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options'
      ]
    }
  ];

  const savings = (plan: any) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  const handleSubscribe = (planName: string) => {
    createCheckout(planName);
  };

  const isCurrentPlan = (planName: string) => {
    return subscribed && subscription_tier === planName;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 mb-6">Scale your breeding business with our professional tools</p>
        
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${!isYearly ? 'font-semibold' : 'text-gray-600'}`}>Monthly</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`text-sm ${isYearly ? 'font-semibold' : 'text-gray-600'}`}>
            Yearly
            <Badge className="ml-2 bg-green-100 text-green-800">Save up to 25%</Badge>
          </span>
        </div>
      </div>

      {subscribed && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">
                Current Plan: {subscription_tier}
              </p>
              <p className="text-sm text-green-600">
                You have an active subscription
              </p>
            </div>
            <Button
              onClick={openCustomerPortal}
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <Settings size={16} className="mr-2" />
              Manage Subscription
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const period = isYearly ? 'year' : 'month';
          const isCurrentlySubscribed = isCurrentPlan(plan.name);
          
          return (
            <Card 
              key={index} 
              className={`relative ${plan.borderColor} ${
                plan.popular ? 'ring-2 ring-yellow-400' : ''
              } ${isCurrentlySubscribed ? 'ring-2 ring-green-400' : ''}`}
            >
              {plan.popular && !isCurrentlySubscribed && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              {isCurrentlySubscribed && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white">Your Plan</Badge>
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.bgColor}`}>
                <div className="flex justify-center mb-2">
                  <Icon size={32} className={plan.color} />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${price}
                  <span className="text-base font-normal text-gray-600">/{period}</span>
                </div>
                {isYearly && (
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
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={loading || isCurrentlySubscribed || !user}
                  className={`w-full ${
                    isCurrentlySubscribed 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : plan.popular 
                        ? 'bg-yellow-500 hover:bg-yellow-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {loading ? (
                    'Loading...'
                  ) : isCurrentlySubscribed ? (
                    'Current Plan'
                  ) : !user ? (
                    'Sign in to Subscribe'
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Card className="inline-block">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Need a custom solution?</h3>
            <p className="text-gray-600 mb-4">Contact our sales team for enterprise pricing and custom features.</p>
            <Button variant="outline">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricingPlans;
