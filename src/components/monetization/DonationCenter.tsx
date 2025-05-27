
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Users, 
  Shield, 
  Award,
  Target,
  TrendingUp,
  Gift
} from 'lucide-react';
import { PRICING_CONFIG } from '@/config/pricing';

const DonationCenter = () => {
  const [selectedAmount, setSelectedAmount] = useState(25);
  
  const donationAmounts = [10, 25, 50, 100, 250, 500];
  
  const currentMonthlyDonations = 6780;
  const monthlyGoal = PRICING_CONFIG.donationGoals.monthly;
  const progressPercentage = (currentMonthlyDonations / monthlyGoal) * 100;

  const impactStats = [
    {
      icon: Shield,
      title: 'Dogs Rescued',
      value: '1,247',
      description: 'This year through our rescue partners',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Families Matched',
      value: '3,892',
      description: 'Happy adoptions facilitated',
      color: 'text-green-600'
    },
    {
      icon: Award,
      title: 'Shelters Supported',
      value: '156',
      description: 'Partner shelters receiving funds',
      color: 'text-purple-600'
    }
  ];

  const donationTiers = [
    {
      amount: 25,
      title: 'Supporter',
      description: 'Helps feed a rescue dog for a week',
      badge: 'Helper'
    },
    {
      amount: 50,
      title: 'Advocate',
      description: 'Covers vaccination for one puppy',
      badge: 'Advocate'
    },
    {
      amount: 100,
      title: 'Champion',
      description: 'Supports a dog\'s medical care',
      badge: 'Champion'
    },
    {
      amount: 250,
      title: 'Guardian',
      description: 'Sponsors a dog\'s full rehabilitation',
      badge: 'Guardian'
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Heart size={48} className="text-red-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Help Us Save More Dogs</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your donation helps us connect more rescue dogs with loving families and support 
          shelters across the country. Every dollar makes a difference.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Donation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift size={20} className="text-red-500" />
              Make a Donation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">Choose an amount:</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {donationAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "default" : "outline"}
                    className={`${selectedAmount === amount ? 'bg-red-500 text-white' : ''}`}
                    onClick={() => setSelectedAmount(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <input
                  type="number"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Custom amount"
                />
              </div>
            </div>

            <div className="space-y-2">
              {donationTiers.map((tier) => {
                if (selectedAmount >= tier.amount) {
                  return (
                    <div key={tier.amount} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-red-500 text-white">{tier.badge}</Badge>
                        <span className="font-medium">{tier.title}</span>
                      </div>
                      <p className="text-sm text-gray-600">{tier.description}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <Button className="w-full bg-red-500 text-white hover:bg-red-600">
              Donate ${selectedAmount}
            </Button>

            <div className="text-xs text-gray-500 text-center">
              Secure payment • Tax-deductible • 100% goes to rescue efforts
            </div>
          </CardContent>
        </Card>

        {/* Progress & Impact */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} className="text-blue-500" />
                Monthly Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">${currentMonthlyDonations.toLocaleString()}</span>
                  <span className="text-gray-600">of ${monthlyGoal.toLocaleString()}</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{Math.round(progressPercentage)}% complete</span>
                  <span>${(monthlyGoal - currentMonthlyDonations).toLocaleString()} to go</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} className="text-green-500" />
                Your Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {impactStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon size={24} className={stat.color} />
                    <div>
                      <div className="font-bold text-lg">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.title}</div>
                      <div className="text-xs text-gray-500">{stat.description}</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sponsor a Rescue */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">Sponsor a Rescue Dog</h3>
              <p className="text-gray-600 mb-4">
                Choose a specific rescue dog to sponsor their journey to finding a forever home. 
                Get updates and photos of their progress.
              </p>
              <Button className="bg-blue-500 text-white hover:bg-blue-600">
                Browse Dogs to Sponsor
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=150&h=150&fit=crop" 
                alt="Rescue dog" 
                className="w-full h-32 object-cover rounded-lg"
              />
              <img 
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=150&h=150&fit=crop" 
                alt="Rescue dog" 
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Giving */}
      <Card>
        <CardContent className="p-6 text-center">
          <Heart size={32} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Become a Monthly Hero</h3>
          <p className="text-gray-600 mb-4">
            Join our monthly giving program and provide consistent support for rescue dogs in need.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">Learn More</Button>
            <Button className="bg-red-500 text-white hover:bg-red-600">
              Start Monthly Giving
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationCenter;
