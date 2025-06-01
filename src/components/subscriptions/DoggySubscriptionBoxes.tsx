
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Gift, 
  Heart, 
  Star, 
  Calendar, 
  Truck, 
  CheckCircle, 
  Settings,
  PlusCircle,
  Edit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

interface DogProfile {
  id: string;
  name: string;
  breed: string;
  size: 'small' | 'medium' | 'large' | 'xl';
  age: number;
  allergies: string[];
  preferences: string[];
}

const DoggySubscriptionBoxes = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [dogProfiles, setDogProfiles] = useState<DogProfile[]>([]);
  const [showAddDog, setShowAddDog] = useState(false);
  const [newDog, setNewDog] = useState({
    name: '',
    breed: '',
    size: 'medium' as const,
    age: 1,
    allergies: [] as string[],
    preferences: [] as string[]
  });

  const { user } = useAuth();
  const { createCheckout } = useSubscription();
  const { toast } = useToast();

  const subscriptionPlans = [
    {
      id: 'puppy-essentials',
      name: 'Puppy Essentials',
      price: 19.99,
      description: 'Perfect starter box for new puppy parents',
      features: [
        '3-4 toys (size appropriate)',
        '2-3 training treats',
        '1 grooming item',
        'Puppy care guide'
      ],
      popular: false
    },
    {
      id: 'happy-paws',
      name: 'Happy Paws',
      price: 29.99,
      description: 'Our most popular box with variety and value',
      features: [
        '4-5 premium toys',
        '3-4 gourmet treats',
        '2 grooming/care items',
        '1 accessory (collar, bandana, etc.)',
        'Monthly breed spotlight guide'
      ],
      popular: true
    },
    {
      id: 'luxury-tail-wags',
      name: 'Luxury Tail Wags',
      price: 49.99,
      description: 'Premium experience for pampered pups',
      features: [
        '6-7 premium toys & accessories',
        '4-5 artisanal treats',
        '3 grooming/wellness items',
        '1 premium accessory',
        'Personalized note',
        'Free shipping',
        'First access to new products'
      ],
      popular: false
    }
  ];

  const sampleBoxContents = {
    'small': {
      toys: ['Squeaky Duck (Mini)', 'Rope Toy (Small)', 'Puzzle Ball'],
      treats: ['Training Bites', 'Dental Chews (Small)', 'Freeze-Dried Chicken'],
      accessories: ['Bow Tie', 'Mini Brush', 'Poop Bags']
    },
    'medium': {
      toys: ['Tennis Ball Set', 'Tug Rope', 'Chew Toy', 'Interactive Feeder'],
      treats: ['Bully Sticks', 'Sweet Potato Chews', 'Training Treats'],
      accessories: ['Bandana', 'Grooming Wipes', 'Waste Bags']
    },
    'large': {
      toys: ['Large Kong Toy', 'Heavy Duty Rope', 'Fetch Stick', 'Puzzle Feeder'],
      treats: ['Large Bully Sticks', 'Antler Chews', 'Protein Bars'],
      accessories: ['Large Bandana', 'Deshedding Tool', 'Car Harness']
    }
  };

  const allergyOptions = [
    'Chicken', 'Beef', 'Dairy', 'Grain', 'Soy', 'Fish', 'Lamb', 'Pork'
  ];

  const preferenceOptions = [
    'Squeaky toys', 'Rope toys', 'Puzzle toys', 'Plush toys', 
    'Dental chews', 'Training treats', 'Grooming items', 'Accessories'
  ];

  const handleAddDog = () => {
    if (!newDog.name || !newDog.breed) {
      toast({
        title: "Missing Information",
        description: "Please fill in your dog's name and breed",
        variant: "destructive"
      });
      return;
    }

    const dogProfile: DogProfile = {
      id: Date.now().toString(),
      ...newDog
    };

    setDogProfiles([...dogProfiles, dogProfile]);
    setNewDog({
      name: '',
      breed: '',
      size: 'medium',
      age: 1,
      allergies: [],
      preferences: []
    });
    setShowAddDog(false);

    toast({
      title: "Dog Profile Added!",
      description: `${dogProfile.name}'s profile has been created successfully.`
    });
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to subscribe to doggy boxes",
        variant: "destructive"
      });
      return;
    }

    if (dogProfiles.length === 0) {
      toast({
        title: "Add Your Dog First",
        description: "Please add at least one dog profile to customize your box",
        variant: "destructive"
      });
      return;
    }

    // In a real implementation, you'd create a specific checkout for the doggy subscription
    // For now, we'll use the existing subscription system
    await createCheckout(`doggy-${planId}`);
  };

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    if (checked) {
      setNewDog(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy]
      }));
    } else {
      setNewDog(prev => ({
        ...prev,
        allergies: prev.allergies.filter(a => a !== allergy)
      }));
    }
  };

  const handlePreferenceChange = (preference: string, checked: boolean) => {
    if (checked) {
      setNewDog(prev => ({
        ...prev,
        preferences: [...prev.preferences, preference]
      }));
    } else {
      setNewDog(prev => ({
        ...prev,
        preferences: prev.preferences.filter(p => p !== preference)
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Gift className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-bold">Doggy Subscription Boxes</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Monthly curated boxes of toys, treats, and essentials tailored specifically for your dog's size, breed, and preferences
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Truck className="h-4 w-4" />
            <span>Free shipping on all boxes</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Skip or cancel anytime</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>100% satisfaction guarantee</span>
          </div>
        </div>
      </div>

      {/* Dog Profiles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Dogs</h2>
          <Button 
            onClick={() => setShowAddDog(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Dog Profile
          </Button>
        </div>

        {dogProfiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogProfiles.map((dog) => (
              <Card key={dog.id} className="border border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{dog.name}</h3>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Breed: {dog.breed}</p>
                    <p>Size: {dog.size}</p>
                    <p>Age: {dog.age} years</p>
                    {dog.allergies.length > 0 && (
                      <p>Allergies: {dog.allergies.join(', ')}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showAddDog && (
          <Card className="border border-purple-200">
            <CardHeader>
              <CardTitle>Add Your Dog's Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dogName">Dog's Name *</Label>
                  <Input
                    id="dogName"
                    value={newDog.name}
                    onChange={(e) => setNewDog(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your dog's name"
                  />
                </div>
                <div>
                  <Label htmlFor="dogBreed">Breed *</Label>
                  <Input
                    id="dogBreed"
                    value={newDog.breed}
                    onChange={(e) => setNewDog(prev => ({ ...prev, breed: e.target.value }))}
                    placeholder="e.g., Golden Retriever"
                  />
                </div>
                <div>
                  <Label htmlFor="dogSize">Size</Label>
                  <Select value={newDog.size} onValueChange={(value: any) => setNewDog(prev => ({ ...prev, size: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (Under 25 lbs)</SelectItem>
                      <SelectItem value="medium">Medium (25-60 lbs)</SelectItem>
                      <SelectItem value="large">Large (60-90 lbs)</SelectItem>
                      <SelectItem value="xl">Extra Large (90+ lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dogAge">Age (years)</Label>
                  <Input
                    id="dogAge"
                    type="number"
                    min="0"
                    max="20"
                    value={newDog.age}
                    onChange={(e) => setNewDog(prev => ({ ...prev, age: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div>
                <Label>Allergies (Select any that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {allergyOptions.map((allergy) => (
                    <div key={allergy} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergy-${allergy}`}
                        checked={newDog.allergies.includes(allergy)}
                        onCheckedChange={(checked) => handleAllergyChange(allergy, checked as boolean)}
                      />
                      <Label htmlFor={`allergy-${allergy}`} className="text-sm">{allergy}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Preferences (What does your dog love?)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {preferenceOptions.map((preference) => (
                    <div key={preference} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pref-${preference}`}
                        checked={newDog.preferences.includes(preference)}
                        onCheckedChange={(checked) => handlePreferenceChange(preference, checked as boolean)}
                      />
                      <Label htmlFor={`pref-${preference}`} className="text-sm">{preference}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddDog} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Add Dog Profile
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sample Box Preview */}
      {dogProfiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">What's Inside Your Box</h2>
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-purple-600" />
                    Toys
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {sampleBoxContents[dogProfiles[0]?.size || 'medium'].toys.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Treats
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {sampleBoxContents[dogProfiles[0]?.size || 'medium'].treats.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Accessories
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {sampleBoxContents[dogProfiles[0]?.size || 'medium'].accessories.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">Choose Your Monthly Box</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative border-2 ${
                plan.popular 
                  ? 'border-purple-500 shadow-lg' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-purple-600">
                  ${plan.price}
                  <span className="text-base font-normal text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                  disabled={!user || dogProfiles.length === 0}
                >
                  {!user ? 'Sign In to Subscribe' : dogProfiles.length === 0 ? 'Add Dog Profile First' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Can I skip a month?</h3>
              <p className="text-sm text-gray-600">
                Yes! You can skip any month or pause your subscription anytime through your account settings.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">What if my dog doesn't like something?</h3>
              <p className="text-sm text-gray-600">
                We offer a 100% satisfaction guarantee. Contact us and we'll make it right with a replacement or credit.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">When will my box ship?</h3>
              <p className="text-sm text-gray-600">
                Boxes ship between the 1st-5th of each month and typically arrive within 5-7 business days.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Can I have multiple dogs?</h3>
              <p className="text-sm text-gray-600">
                Absolutely! Add multiple dog profiles and we'll customize your box for all your furry friends.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoggySubscriptionBoxes;
