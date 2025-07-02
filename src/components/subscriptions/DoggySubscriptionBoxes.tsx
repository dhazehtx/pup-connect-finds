
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Gift, Truck, Heart, Crown } from 'lucide-react';
import StripeCheckout from '@/components/checkout/StripeCheckout';

const DoggySubscriptionBoxes = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const subscriptionPlans = [
    {
      id: 'small',
      name: 'Small Dog Box',
      price: 24.99,
      originalPrice: 29.99,
      size: 'Small Dogs (up to 25 lbs)',
      popular: false,
      items: 4-6,
      description: 'Perfect for your little companion',
      features: [
        '4-6 premium items monthly',
        '2-3 toys + treats & chews',
        'All-natural, high-quality products',
        'Size-appropriate selections',
        'Free shipping'
      ]
    },
    {
      id: 'medium', 
      name: 'Medium Dog Box',
      price: 29.99,
      originalPrice: 34.99,  
      size: 'Medium Dogs (25-65 lbs)',
      popular: true,
      items: 5-7,
      description: 'Most popular choice for medium pups',
      features: [
        '5-7 premium items monthly',
        '3-4 toys + treats & chews',
        'All-natural, high-quality products', 
        'Size-appropriate selections',
        'Free shipping',
        'Bonus surprise item'
      ]
    },
    {
      id: 'large',
      name: 'Large Dog Box', 
      price: 34.99,
      originalPrice: 39.99,
      size: 'Large Dogs (65+ lbs)',
      popular: false,
      items: 6-8,
      description: 'Extra goodies for your big buddy',
      features: [
        '6-8 premium items monthly',
        '4-5 toys + treats & chews',
        'All-natural, high-quality products',
        'Size-appropriate selections', 
        'Free shipping',
        'Extra large toys included'
      ]
    }
  ];

  const handleSubscribe = (plan: any) => {
    setSelectedPlan({
      name: `${plan.name} Subscription`,
      price: plan.price,
      features: plan.features,
      popular: plan.popular
    });
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Gift className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Monthly Pup Boxes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Surprise your furry friend with premium toys, treats, and goodies delivered monthly
          </p>
          
          <div className="flex justify-center gap-6 mt-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Premium Quality
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-green-500" />
              Free Shipping
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Dog Approved
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
              } transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <p className="text-sm text-gray-600">{plan.size}</p>
                
                <div className="mt-4">
                  <div className="text-3xl font-bold text-blue-600">
                    ${plan.price}
                    <span className="text-base font-normal text-gray-600">/month</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-500">
                      <span className="line-through">${plan.originalPrice}</span>
                      <Badge variant="secondary" className="ml-2 text-green-600">
                        Save ${(plan.originalPrice - plan.price).toFixed(2)}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
                  <span className="font-semibold text-blue-800">
                    {plan.items} Premium Items Monthly
                  </span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full font-semibold ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Subscribe Now
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  Cancel anytime • No commitment
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border">
          <h2 className="text-2xl font-bold text-center mb-8">What's Inside Every Box?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Premium Toys</h3>
              <p className="text-sm text-gray-600">Durable, safe toys that keep your pup entertained</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Healthy Treats</h3>
              <p className="text-sm text-gray-600">All-natural, nutritious treats your dog will love</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Chew Items</h3>
              <p className="text-sm text-gray-600">Long-lasting chews for dental health and fun</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Surprise Items</h3>
              <p className="text-sm text-gray-600">Special goodies to make each box exciting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      <StripeCheckout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        productType="pupbox"
        planDetails={selectedPlan}
      />
    </div>
  );
};

export default DoggySubscriptionBoxes;
