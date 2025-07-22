import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  DollarSign, 
  Coffee, 
  Gift,
  Star,
  MapPin,
  Users,
  CheckCircle,
  Candy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DonationPaymentProcessor from './DonationPaymentProcessor';

interface TipOption {
  amount: number;
  message: string;
  icon: React.ComponentType<any>;
}

interface ShelterProfile {
  id: string;
  name: string;
  type: 'shelter' | 'rescue' | 'foster';
  location: string;
  description: string;
  image: string;
  rating: number;
  totalTips: number;
  verified: boolean;
  recentActivity: string;
}

const ShelterTipping = () => {
  const [selectedTip, setSelectedTip] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');
  const { toast } = useToast();

  const tipOptions: TipOption[] = [
    { amount: 1, message: 'Small treat 🍪', icon: Candy },
    { amount: 5, message: 'Buy a coffee ☕', icon: Coffee },
    { amount: 10, message: 'Small thank you 💝', icon: Gift },
    { amount: 25, message: 'Big appreciation 🙏', icon: Heart },
    { amount: 50, message: 'Amazing support! 🌟', icon: Star }
  ];

  const featuredShelters: ShelterProfile[] = [
    {
      id: '1',
      name: 'Sarah\'s Golden Rescue',
      type: 'rescue',
      location: 'Denver, CO',
      description: 'Dedicated to rescuing and rehabilitating Golden Retrievers',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      totalTips: 245,
      verified: true,
      recentActivity: 'Just helped 3 puppies find forever homes!'
    },
    {
      id: '2',
      name: 'Mike\'s Shelter Network',
      type: 'shelter',
      location: 'Austin, TX',
      description: 'Supporting multiple local shelters with resources and volunteers',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      totalTips: 189,
      verified: true,
      recentActivity: 'Organized a successful adoption event - 12 dogs adopted!'
    },
    {
      id: '3',
      name: 'Emma\'s Foster Care',
      type: 'foster',
      location: 'Seattle, WA',
      description: 'Providing temporary foster care for dogs awaiting adoption',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 4.7,
      totalTips: 156,
      verified: true,
      recentActivity: 'Currently fostering 5 rescue puppies - all healthy!'
    }
  ];

  const handleTipSuccess = () => {
    toast({
      title: "Thank you! 💝",
      description: "Your donation has been processed successfully!",
    });
    setCustomAmount('');
  };

  const handleTip = (shelter: ShelterProfile, amount: number) => {
    toast({
      title: "Tip Sent! 💝",
      description: `Your $${amount} tip has been sent to ${shelter.name}. Thank you for supporting rescue work!`,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shelter': return '🏠';
      case 'rescue': return '🆘';
      case 'foster': return '👨‍👩‍👧‍👦';
      default: return '❤️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'shelter': return 'bg-blue-100 text-blue-800';
      case 'rescue': return 'bg-red-100 text-red-800';
      case 'foster': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <DollarSign size={48} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Support Rescue Heroes</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Show appreciation to individual rescue workers, shelter volunteers, and foster families 
          who are making a difference in dogs' lives every day.
        </p>
      </div>

      {/* Quick Tip Section */}
      <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee size={20} className="text-green-600" />
            Quick Appreciation Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {tipOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DonationPaymentProcessor
                  key={option.amount}
                  recipientId="quick-tip"
                  recipientName="Rescue Heroes Fund"
                  amount={option.amount}
                  onSuccess={handleTipSuccess}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Featured Rescue Workers */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center">Featured Rescue Heroes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredShelters.map((shelter) => (
            <Card key={shelter.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={shelter.image} 
                  alt={shelter.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {shelter.verified && (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge className={getTypeColor(shelter.type)}>
                    {getTypeIcon(shelter.type)} {shelter.type}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg">{shelter.name}</h4>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{shelter.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  {shelter.location}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{shelter.description}</p>
                
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-800 font-medium">Recent Activity:</p>
                  <p className="text-sm text-blue-600">{shelter.recentActivity}</p>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{shelter.totalTips} supporters</span>
                  </div>
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {tipOptions.slice(0, 3).map((option) => (
                      <DonationPaymentProcessor
                        key={option.amount}
                        recipientId={shelter.id}
                        recipientName={shelter.name}
                        amount={option.amount}
                        onSuccess={handleTipSuccess}
                      />
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Custom"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="flex-1"
                    />
                    <DonationPaymentProcessor
                      recipientId={shelter.id}
                      recipientName={shelter.name}
                      amount={parseInt(customAmount) || 0}
                      onSuccess={() => {
                        handleTipSuccess();
                        setCustomAmount('');
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Become a Hero CTA */}
      <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-8 text-center">
          <Heart size={32} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Become a Rescue Hero</h3>
          <p className="text-gray-600 mb-4">
            Are you involved in dog rescue work? Join our platform to receive support 
            and appreciation from the community.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">Learn More</Button>
            <Button className="bg-purple-500 text-white hover:bg-purple-600">
              Apply to Join
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShelterTipping;
