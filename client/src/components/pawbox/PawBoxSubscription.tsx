
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Gift, 
  Heart, 
  Star, 
  Truck,
  Calendar,
  Check,
  Sparkles
} from 'lucide-react';

const PawBoxSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('monthly');
  const [dogProfile, setDogProfile] = useState({
    name: '',
    breed: '',
    size: '',
    age: '',
    dietary_restrictions: '',
    favorite_treats: '',
    activity_level: ''
  });
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA'
  });

  const subscriptionTiers = [
    {
      id: 'basic',
      name: 'Basic PawBox',
      price: { monthly: 24.99, quarterly: 67.47 },
      originalPrice: { monthly: 29.99, quarterly: 89.97 },
      description: 'Perfect starter box for your furry friend',
      features: [
        '3-4 premium treats',
        '1 engaging toy',
        'Monthly care tips',
        'Free shipping'
      ],
      popular: false,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop'
    },
    {
      id: 'premium',
      name: 'Premium PawBox',
      price: { monthly: 39.99, quarterly: 107.97 },
      originalPrice: { monthly: 49.99, quarterly: 149.97 },
      description: 'Our most popular box with extra goodies',
      features: [
        '5-6 premium treats',
        '2 interactive toys',
        'Grooming product',
        'Personalized care guide',
        'Free shipping',
        'Size-specific items'
      ],
      popular: true,
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop'
    },
    {
      id: 'deluxe',
      name: 'Deluxe PawBox',
      price: { monthly: 59.99, quarterly: 161.97 },
      originalPrice: { monthly: 79.99, quarterly: 239.97 },
      description: 'Ultimate luxury experience for pampered pups',
      features: [
        '7-8 premium treats',
        '3 high-quality toys',
        '2 grooming products',
        'Health supplement',
        'Personalized training tips',
        'Priority customer support',
        'Free shipping',
        'Breed-specific customization'
      ],
      popular: false,
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=200&fit=crop'
    }
  ];

  const dogSizes = [
    { value: 'small', label: 'Small (0-25 lbs)' },
    { value: 'medium', label: 'Medium (26-60 lbs)' },
    { value: 'large', label: 'Large (61-100 lbs)' },
    { value: 'extra_large', label: 'Extra Large (100+ lbs)' }
  ];

  const activityLevels = [
    { value: 'low', label: 'Low - Prefers lounging' },
    { value: 'moderate', label: 'Moderate - Regular walks' },
    { value: 'high', label: 'High - Very active' },
    { value: 'extreme', label: 'Extreme - Non-stop energy' }
  ];

  const handleDogProfileChange = (field: string, value: string) => {
    setDogProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateSavings = (tier: typeof subscriptionTiers[0]) => {
    const monthlySavings = tier.originalPrice.monthly - tier.price.monthly;
    const quarterlySavings = tier.originalPrice.quarterly - tier.price.quarterly;
    
    if (selectedFrequency === 'monthly') {
      return monthlySavings;
    }
    return quarterlySavings / 3; // Per month savings for quarterly
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to PawBox.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTier) {
      toast({
        title: "Please Select a Plan",
        description: "Choose a subscription tier to continue.",
        variant: "destructive"
      });
      return;
    }

    const selectedPlan = subscriptionTiers.find(tier => tier.id === selectedTier);
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('pawbox_subscriptions')
        .insert({
          user_id: user.id,
          subscription_tier: selectedTier,
          dog_profile: dogProfile,
          frequency: selectedFrequency,
          price: selectedPlan.price[selectedFrequency as keyof typeof selectedPlan.price],
          delivery_address: deliveryAddress,
          status: 'active',
          next_delivery_date: new Date(Date.now() + (selectedFrequency === 'monthly' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Welcome to PawBox! 🎉",
        description: "Your subscription has been activated. Your first box will arrive soon!"
      });

      // Reset form
      setSelectedTier('');
      setDogProfile({
        name: '',
        breed: '',
        size: '',
        age: '',
        dietary_restrictions: '',
        favorite_treats: '',
        activity_level: ''
      });
      setDeliveryAddress({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'USA'
      });
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Gift className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            PawBox
          </h1>
          <Sparkles className="h-8 w-8 text-pink-600" />
        </div>
        <p className="text-xl text-gray-600 mb-2">Monthly surprises for your best friend</p>
        <p className="text-gray-500">Curated treats, toys, and care products delivered to your door</p>
      </div>

      {/* Subscription Tiers */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {subscriptionTiers.map((tier) => (
          <Card 
            key={tier.id} 
            className={`relative cursor-pointer transition-all hover:shadow-lg ${
              selectedTier === tier.id ? 'ring-2 ring-purple-500 shadow-lg' : ''
            } ${tier.popular ? 'border-purple-200' : ''}`}
            onClick={() => setSelectedTier(tier.id)}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white px-4 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <div className="relative">
              <img
                src={tier.image}
                alt={tier.name}
                className="w-full h-32 object-cover rounded-t-lg"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90">
                  Save ${calculateSavings(tier).toFixed(0)}/mo
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
              
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-purple-600">
                    ${tier.price[selectedFrequency as keyof typeof tier.price]}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${tier.originalPrice[selectedFrequency as keyof typeof tier.originalPrice]}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {selectedFrequency === 'monthly' ? 'per month' : 'every 3 months'}
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                variant={selectedTier === tier.id ? "default" : "outline"}
                className="w-full"
                onClick={() => setSelectedTier(tier.id)}
              >
                {selectedTier === tier.id ? 'Selected' : 'Choose Plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Frequency Toggle */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4">
            <Label className="font-medium">Delivery Frequency:</Label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={selectedFrequency === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedFrequency('monthly')}
                className="rounded"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Monthly
              </Button>
              <Button
                variant={selectedFrequency === 'quarterly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedFrequency('quarterly')}
                className="rounded"
              >
                <Gift className="h-4 w-4 mr-1" />
                Quarterly (Save More)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedTier && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Dog Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Tell Us About Your Dog
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dog_name">Dog's Name</Label>
                  <Input
                    id="dog_name"
                    value={dogProfile.name}
                    onChange={(e) => handleDogProfileChange('name', e.target.value)}
                    placeholder="Buddy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dog_breed">Breed</Label>
                  <Input
                    id="dog_breed"
                    value={dogProfile.breed}
                    onChange={(e) => handleDogProfileChange('breed', e.target.value)}
                    placeholder="Golden Retriever"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dog_size">Size</Label>
                  <Select value={dogProfile.size} onValueChange={(value) => handleDogProfileChange('size', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {dogSizes.map(size => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dog_age">Age</Label>
                  <Input
                    id="dog_age"
                    value={dogProfile.age}
                    onChange={(e) => handleDogProfileChange('age', e.target.value)}
                    placeholder="3 years"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity_level">Activity Level</Label>
                <Select value={dogProfile.activity_level} onValueChange={(value) => handleDogProfileChange('activity_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
                <Input
                  id="dietary_restrictions"
                  value={dogProfile.dietary_restrictions}
                  onChange={(e) => handleDogProfileChange('dietary_restrictions', e.target.value)}
                  placeholder="Grain-free, no chicken, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favorite_treats">Favorite Treats</Label>
                <Input
                  id="favorite_treats"
                  value={dogProfile.favorite_treats}
                  onChange={(e) => handleDogProfileChange('favorite_treats', e.target.value)}
                  placeholder="Peanut butter, salmon, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-500" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={deliveryAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={deliveryAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="San Francisco"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={deliveryAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="CA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={deliveryAddress.zip}
                  onChange={(e) => handleAddressChange('zip', e.target.value)}
                  placeholder="94105"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🚚 Free Shipping Included</h4>
                <p className="text-sm text-blue-700">
                  All PawBox subscriptions include free shipping to your door. 
                  Expect delivery within 3-5 business days of your subscription date.
                </p>
              </div>

              <Button 
                onClick={handleSubscribe} 
                disabled={loading || !dogProfile.name || !deliveryAddress.street}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                {loading ? 'Creating Subscription...' : `Subscribe to ${subscriptionTiers.find(t => t.id === selectedTier)?.name}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PawBoxSubscription;
