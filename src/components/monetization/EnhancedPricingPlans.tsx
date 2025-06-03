
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Crown, Star, Zap, Heart, Shield, Users, Video, Phone, Camera, MessageSquare } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { PRICING_CONFIG } from '@/config/pricing';

const EnhancedPricingPlans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { subscribed, subscription_tier, createCheckout, openCustomerPortal, loading } = useSubscription();
  const { user } = useAuth();
  
  const plans = [
    {
      name: 'Basic',
      displayName: 'Pup Seeker',
      icon: Heart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      popular: false,
      monthlyPrice: PRICING_CONFIG.subscriptions.basic.monthly,
      yearlyPrice: PRICING_CONFIG.subscriptions.basic.yearly,
      features: PRICING_CONFIG.subscriptions.basic.features,
      description: 'Perfect for dog lovers looking to adopt or browse',
      buttonText: 'Start Free',
      savings: null,
      socialFeatures: [
        { icon: Camera, text: 'Post content (1/day)' },
        { icon: MessageSquare, text: 'Message sellers (5/day)' },
        { icon: Heart, text: 'Save favorites' },
        { icon: Users, text: 'Follow dogs & breeders' }
      ]
    },
    {
      name: 'Pro',
      displayName: 'Pup Pro',
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      popular: true,
      monthlyPrice: PRICING_CONFIG.subscriptions.pro.monthly,
      yearlyPrice: PRICING_CONFIG.subscriptions.pro.yearly,
      features: PRICING_CONFIG.subscriptions.pro.features,
      description: 'For hobby breeders & pet businesses wanting more exposure',
      buttonText: 'Upgrade to Pup Pro',
      savings: 'Save $30/year',
      socialFeatures: [
        { icon: MessageSquare, text: 'Unlimited messaging' },
        { icon: Camera, text: 'Unlimited content posting' },
        { icon: Star, text: 'Priority search placement' },
        { icon: Users, text: 'Business profile' }
      ]
    },
    {
      name: 'Enterprise',
      displayName: 'Pup Partner',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      popular: false,
      monthlyPrice: PRICING_CONFIG.subscriptions.business.monthly,
      yearlyPrice: PRICING_CONFIG.subscriptions.business.yearly,
      features: PRICING_CONFIG.subscriptions.business.features,
      description: 'For licensed breeders, shelters & pet service providers',
      buttonText: 'Become Pup Partner',
      savings: 'Save $80/year',
      socialFeatures: [
        { icon: Shield, text: 'Verified business status' },
        { icon: Star, text: 'Featured listings' },
        { icon: Video, text: 'Virtual meet & greet events' },
        { icon: Users, text: 'Team member access' }
      ]
    }
  ];

  const handleSubscribe = (planName: string) => {
    if (planName === 'Basic') {
      // Free tier - no checkout needed
      return;
    }
    createCheckout(planName);
  };

  const isCurrentPlan = (planName: string) => {
    return subscribed && subscription_tier === planName;
  };

  const isFree = (plan: any) => {
    return plan.monthlyPrice === 0 && plan.yearlyPrice === 0;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">Choose Your Perfect Plan</h2>
        <p className="text-xl text-gray-600 mb-6">From casual browsing to professional breeding - we have the right tier for you</p>
        
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${!isYearly ? 'font-semibold' : 'text-gray-600'}`}>Monthly</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`text-sm ${isYearly ? 'font-semibold' : 'text-gray-600'}`}>
            Yearly
            <Badge className="ml-2 bg-green-100 text-green-800">Save up to $80</Badge>
          </span>
        </div>
      </div>

      {subscribed && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">
                Current Plan: {subscription_tier === 'Pro' ? 'Pup Pro' : subscription_tier === 'Enterprise' ? 'Pup Partner' : subscription_tier}
              </p>
              <p className="text-sm text-green-600">
                You're getting the most out of My Pup!
              </p>
            </div>
            <Button
              onClick={openCustomerPortal}
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <Shield size={16} className="mr-2" />
              Manage Plan
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const period = isYearly ? 'year' : 'month';
          const isCurrentlySubscribed = isCurrentPlan(plan.name);
          const planIsFree = isFree(plan);
          
          return (
            <Card 
              key={index} 
              className={`relative ${plan.borderColor} ${
                plan.popular ? 'ring-2 ring-yellow-400 scale-105' : ''
              } ${isCurrentlySubscribed ? 'ring-2 ring-green-400' : ''} transition-all hover:shadow-lg`}
            >
              {plan.popular && !isCurrentlySubscribed && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-white text-sm px-4 py-1">🔥 Most Popular</Badge>
                </div>
              )}
              
              {isCurrentlySubscribed && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white text-sm px-4 py-1">✅ Your Plan</Badge>
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.bgColor} pb-6`}>
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full ${plan.bgColor} border-2 ${plan.borderColor}`}>
                    <Icon size={32} className={plan.color} />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{plan.displayName}</CardTitle>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                
                <div className="space-y-2">
                  {planIsFree ? (
                    <div className="text-4xl font-bold text-green-600">Free</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold">
                        ${price}
                        <span className="text-lg font-normal text-gray-600">/{period}</span>
                      </div>
                      {isYearly && plan.savings && (
                        <div className="text-sm text-green-600 font-medium">
                          {plan.savings}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Social Features Highlight */}
                <div className="mt-4 space-y-2">
                  {plan.socialFeatures.map((feature, idx) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div key={idx} className="flex items-center justify-center gap-2 text-sm">
                        <FeatureIcon size={14} className={plan.color} />
                        <span>{feature.text}</span>
                      </div>
                    );
                  })}
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={loading || isCurrentlySubscribed || (!user && !planIsFree)}
                  className={`w-full h-12 text-base font-semibold ${
                    isCurrentlySubscribed 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : plan.popular 
                        ? 'bg-yellow-500 hover:bg-yellow-600' 
                        : planIsFree
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-purple-500 hover:bg-purple-600'
                  } text-white transition-colors`}
                >
                  {loading ? (
                    'Loading...'
                  ) : isCurrentlySubscribed ? (
                    '✅ Current Plan'
                  ) : !user && !planIsFree ? (
                    'Sign in to Subscribe'
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enterprise/Agency Add-on Section */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold mb-8">Need More Power?</h3>
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="p-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-purple-100">
                <Zap size={40} className="text-purple-600" />
              </div>
            </div>
            <h4 className="text-2xl font-bold mb-4">Pup Agency Dashboard</h4>
            <p className="text-gray-600 mb-4">Starting at $99/month</p>
            <p className="text-gray-700 mb-6">
              For large shelters, regional breeder networks, or agencies managing 20+ dogs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                <span>Multi-location management</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                <span>Team user permissions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                <span>Monthly performance reports</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                <span>Dedicated support manager</span>
              </div>
            </div>
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Contact Sales Team
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Value Proposition Section */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold mb-8">Why Choose My Pup?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-lg mb-2">Verified & Safe</h4>
            <p className="text-gray-600">All breeders and sellers are verified for your peace of mind</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-yellow-600" />
            </div>
            <h4 className="font-semibold text-lg mb-2">Perfect Matches</h4>
            <p className="text-gray-600">Find the ideal companion based on your lifestyle and preferences</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-lg mb-2">Thriving Community</h4>
            <p className="text-gray-600">Join thousands of dog lovers in our supportive community</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPricingPlans;
