
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Gift, Truck, Calendar, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PupBoxSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [formData, setFormData] = useState({
    box_size: '',
    dog_age_range: '',
    dietary_preferences: [] as string[],
    delivery_frequency: 'monthly',
    shipping_address: {
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'US'
    }
  });

  const plans = [
    {
      id: 'small',
      name: 'Small Pup Box',
      size: 'small',
      price: 19.99,
      description: 'Perfect for dogs under 25 lbs',
      items: '3-4 toys, 2-3 treats, 1 grooming item',
      badge: 'Most Popular'
    },
    {
      id: 'medium',
      name: 'Medium Pup Box',
      size: 'medium', 
      price: 29.99,
      description: 'Great for dogs 25-65 lbs',
      items: '4-5 toys, 3-4 treats, 1-2 grooming items',
      badge: null
    },
    {
      id: 'large',
      name: 'Large Pup Box',
      size: 'large',
      price: 39.99,
      description: 'Ideal for dogs over 65 lbs',
      items: '5-6 toys, 4-5 treats, 2 grooming items',
      badge: 'Best Value'
    }
  ];

  const dietaryOptions = [
    'Grain-free',
    'Organic',
    'Limited ingredients',
    'Chicken-free',
    'Beef-free',
    'No rawhide'
  ];

  const handleDietaryChange = (option: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        dietary_preferences: [...prev.dietary_preferences, option]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dietary_preferences: prev.dietary_preferences.filter(pref => pref !== option)
      }));
    }
  };

  const handleSubscribe = async () => {
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

    setLoading(true);
    try {
      const { error } = await supabase.from('subscription_boxes').insert({
        user_id: user.id,
        box_size: plan.size,
        dog_age_range: formData.dog_age_range,
        dietary_preferences: formData.dietary_preferences,
        delivery_frequency: formData.delivery_frequency,
        monthly_price: plan.price,
        shipping_address: formData.shipping_address,
        status: 'active'
      });

      if (error) throw error;

      toast({
        title: "Subscription created!",
        description: "Your first Pup Box will arrive soon!"
      });
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all ${
              selectedPlan === plan.id 
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
              <div className="text-3xl font-bold text-purple-600">${plan.price}</div>
              <div className="text-sm text-gray-500">per month</div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-600 text-center">{plan.description}</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">What's included:</div>
                <div className="text-sm text-gray-600">{plan.items}</div>
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Truck className="w-4 h-4 mr-1" />
                  Free shipping
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Cancel anytime
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPlan && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Customize Your Box</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Dog's Age Range</label>
                <Select 
                  value={formData.dog_age_range} 
                  onValueChange={(value) => setFormData({...formData, dog_age_range: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="puppy">Puppy (0-1 year)</SelectItem>
                    <SelectItem value="adult">Adult (1-7 years)</SelectItem>
                    <SelectItem value="senior">Senior (7+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Delivery Frequency</label>
                <Select 
                  value={formData.delivery_frequency} 
                  onValueChange={(value) => setFormData({...formData, delivery_frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="bi-monthly">Every 2 months</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Dietary Preferences (Optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dietaryOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dietary_preferences.includes(option)}
                      onChange={(e) => handleDietaryChange(option, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Shipping Address</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name"
                  value={formData.shipping_address.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    shipping_address: {...formData.shipping_address, name: e.target.value}
                  })}
                />
                <Input
                  placeholder="Street Address"
                  value={formData.shipping_address.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    shipping_address: {...formData.shipping_address, street: e.target.value}
                  })}
                  className="md:col-span-2"
                />
                <Input
                  placeholder="City"
                  value={formData.shipping_address.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    shipping_address: {...formData.shipping_address, city: e.target.value}
                  })}
                />
                <Input
                  placeholder="State"
                  value={formData.shipping_address.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    shipping_address: {...formData.shipping_address, state: e.target.value}
                  })}
                />
                <Input
                  placeholder="ZIP Code"
                  value={formData.shipping_address.zip}
                  onChange={(e) => setFormData({
                    ...formData,
                    shipping_address: {...formData.shipping_address, zip: e.target.value}
                  })}
                />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Subscription Summary</h4>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm">30-day money-back guarantee</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {plans.find(p => p.id === selectedPlan)?.name} - ${plans.find(p => p.id === selectedPlan)?.price}/month
              </div>
              <div className="text-xs text-gray-500 mt-1">
                First delivery in 3-5 business days • Cancel anytime
              </div>
            </div>

            <Button 
              onClick={handleSubscribe}
              disabled={loading || !formData.dog_age_range || !formData.shipping_address.name}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              size="lg"
            >
              {loading ? 'Processing...' : 'Start Subscription'}
            </Button>
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
    </div>
  );
};

export default PupBoxSubscription;
