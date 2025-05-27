
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Star, 
  Zap, 
  Eye, 
  TrendingUp, 
  Clock,
  Shield,
  Crown
} from 'lucide-react';
import { PRICING_CONFIG } from '@/config/pricing';

const ListingFees = () => {
  const [selectedPlan, setSelectedPlan] = useState('basic');

  const listingPlans = [
    {
      id: 'basic',
      name: 'Basic Listing',
      price: PRICING_CONFIG.listingFees.basic,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        'Standard visibility in search',
        '30-day listing duration',
        'Up to 8 photos',
        'Basic contact form',
        'Mobile-friendly display'
      ],
      boost: '1x visibility'
    },
    {
      id: 'featured',
      name: 'Featured Listing',
      price: PRICING_CONFIG.listingFees.featured,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      popular: true,
      features: [
        'Priority placement in search',
        '45-day listing duration',
        'Up to 15 photos',
        'Enhanced contact options',
        'Featured badge display',
        'Social media sharing tools'
      ],
      boost: '3x visibility'
    },
    {
      id: 'premium',
      name: 'Premium Spotlight',
      price: PRICING_CONFIG.listingFees.premium,
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: [
        'Top of search results',
        '60-day listing duration',
        'Unlimited photos & videos',
        'Direct phone/email display',
        'Premium spotlight badge',
        'Homepage feature rotation',
        'Advanced analytics',
        'Breeder verification boost'
      ],
      boost: '5x visibility'
    }
  ];

  const selectedPlanData = listingPlans.find(plan => plan.id === selectedPlan);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Choose Your Listing Type</h2>
        <p className="text-gray-600">Get more visibility and find the perfect homes for your puppies faster</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {listingPlans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
              } ${plan.popular ? 'border-yellow-400' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.bgColor} relative`}>
                <div className="flex justify-center mb-2">
                  <Icon size={32} className={plan.color} />
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-2xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-600">/listing</span>
                </div>
                <Badge className={`${plan.bgColor} ${plan.color} border-current`}>
                  {plan.boost}
                </Badge>
              </CardHeader>
              
              <CardContent className="p-4">
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value={plan.id} id={plan.id} />
                    <Label htmlFor={plan.id} className="font-medium">Select this plan</Label>
                  </div>
                </RadioGroup>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlanData && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Selected: {selectedPlanData.name}</h3>
              <div className="text-2xl font-bold text-blue-600">
                ${selectedPlanData.price}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <TrendingUp size={20} className="text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Visibility Boost</div>
                  <div className="text-sm text-green-700">{selectedPlanData.boost}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Clock size={20} className="text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Duration</div>
                  <div className="text-sm text-blue-700">
                    {selectedPlanData.id === 'basic' ? '30' : selectedPlanData.id === 'featured' ? '45' : '60'} days
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <Shield size={20} className="text-purple-600" />
                <div>
                  <div className="font-medium text-purple-900">Support Level</div>
                  <div className="text-sm text-purple-700">
                    {selectedPlanData.id === 'premium' ? 'Priority' : 'Standard'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button className="flex-1 bg-blue-500 text-white hover:bg-blue-600">
                Continue to Payment
              </Button>
              <Button variant="outline" className="flex-1">
                Compare Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 text-center">
          <Zap size={24} className="text-yellow-500 mx-auto mb-2" />
          <h3 className="font-semibold mb-2">Need more exposure?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Upgrade to a subscription plan for unlimited featured listings and advanced tools.
          </p>
          <Button variant="outline" size="sm">
            View Subscription Plans
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListingFees;
