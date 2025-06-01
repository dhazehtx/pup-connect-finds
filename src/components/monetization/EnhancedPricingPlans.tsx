
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Crown, Star, Zap, Settings, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { useEnhancedSubscription } from '@/hooks/useEnhancedSubscription';
import { useAuth } from '@/contexts/AuthContext';

const EnhancedPricingPlans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const { 
    subscribed, 
    subscription_tier, 
    isTrialing,
    daysUntilExpiry,
    canUpgrade,
    canDowngrade,
    loading,
    error,
    createCheckoutWithTrial,
    upgradePlan,
    openCustomerPortal 
  } = useEnhancedSubscription();
  
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
      trialDays: 14,
      features: [
        'Up to 5 dog listings',
        'Basic messaging',
        'Standard support',
        'Basic analytics',
        '14-day free trial'
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
      trialDays: 14,
      features: [
        'Unlimited dog listings',
        'Priority messaging',
        'Advanced search filters',
        'Detailed analytics',
        'Verification badge',
        'Priority support',
        '14-day free trial'
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
      trialDays: 7,
      features: [
        'Everything in Pro',
        'Custom branding',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options',
        '7-day free trial'
      ]
    }
  ];

  const savings = (plan: any) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  const handleSubscribe = async (planName: string) => {
    if (selectedPlan === planName && loading) return;
    
    setSelectedPlan(planName);
    const plan = plans.find(p => p.name === planName);
    
    if (subscription_tier && canUpgrade && planName !== subscription_tier) {
      await upgradePlan(planName);
    } else {
      await createCheckoutWithTrial(planName, plan?.trialDays || 14);
    }
    
    setSelectedPlan(null);
  };

  const isCurrentPlan = (planName: string) => {
    return subscribed && subscription_tier === planName;
  };

  const canUpgradeTo = (planName: string) => {
    const planOrder = ['Basic', 'Pro', 'Enterprise'];
    const currentIndex = subscription_tier ? planOrder.indexOf(subscription_tier) : -1;
    const targetIndex = planOrder.indexOf(planName);
    return canUpgrade && targetIndex > currentIndex;
  };

  const getButtonText = (planName: string) => {
    if (loading && selectedPlan === planName) return 'Processing...';
    if (isCurrentPlan(planName)) return 'Current Plan';
    if (!user) return 'Sign in to Subscribe';
    if (canUpgradeTo(planName)) return 'Upgrade Now';
    return 'Start Free Trial';
  };

  const getButtonVariant = (planName: string) => {
    if (isCurrentPlan(planName)) return 'secondary';
    if (canUpgradeTo(planName)) return 'default';
    return 'default';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 mb-6">
          Scale your breeding business with our professional tools
        </p>
        
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${!isYearly ? 'font-semibold' : 'text-gray-600'}`}>
            Monthly
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`text-sm ${isYearly ? 'font-semibold' : 'text-gray-600'}`}>
            Yearly
            <Badge className="ml-2 bg-green-100 text-green-800">Save up to 25%</Badge>
          </span>
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {subscribed && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800 flex items-center gap-2">
                <Sparkles size={16} />
                Current Plan: {subscription_tier}
                {isTrialing && <Badge variant="secondary">Trial</Badge>}
              </p>
              <p className="text-sm text-green-600">
                {isTrialing && daysUntilExpiry 
                  ? `Trial expires in ${daysUntilExpiry} days`
                  : daysUntilExpiry && daysUntilExpiry > 0
                    ? `Expires in ${daysUntilExpiry} days`
                    : 'Active subscription'
                }
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
          const canUpgradeToThis = canUpgradeTo(plan.name);
          const isProcessing = loading && selectedPlan === plan.name;
          
          return (
            <Card 
              key={index} 
              className={`relative transition-all duration-200 hover:shadow-lg ${plan.borderColor} ${
                plan.popular && !isCurrentlySubscribed ? 'ring-2 ring-yellow-400' : ''
              } ${isCurrentlySubscribed ? 'ring-2 ring-green-400' : ''} ${
                canUpgradeToThis ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              {plan.popular && !isCurrentlySubscribed && !canUpgradeToThis && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              {isCurrentlySubscribed && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white">Your Plan</Badge>
                </div>
              )}

              {canUpgradeToThis && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Upgrade Available</Badge>
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
                {!isCurrentlySubscribed && (
                  <div className="flex items-center justify-center gap-1 text-sm text-blue-600 font-medium">
                    <Clock size={14} />
                    {plan.trialDays}-day free trial
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
                  variant={getButtonVariant(plan.name)}
                  className={`w-full ${
                    isCurrentlySubscribed 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : canUpgradeToThis
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : plan.popular 
                          ? 'bg-yellow-500 hover:bg-yellow-600' 
                          : 'bg-gray-800 hover:bg-gray-900'
                  } text-white ${isProcessing ? 'animate-pulse' : ''}`}
                >
                  {getButtonText(plan.name)}
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
            <p className="text-gray-600 mb-4">
              Contact our sales team for enterprise pricing and custom features.
            </p>
            <Button variant="outline">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedPricingPlans;
