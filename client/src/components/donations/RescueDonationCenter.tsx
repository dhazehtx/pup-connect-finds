
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  Users, 
  Shield, 
  Award,
  Target,
  TrendingUp,
  Gift,
  DollarSign,
  MapPin,
  Calendar,
  Star,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RescueOrganization {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  totalRescued: number;
  currentNeed: string;
  fundingGoal: number;
  currentFunding: number;
  verified: boolean;
  tags: string[];
}

const RescueDonationCenter = () => {
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [selectedRescue, setSelectedRescue] = useState<string | null>(null);
  const [donationType, setDonationType] = useState<'general' | 'specific' | 'emergency'>('general');
  const { toast } = useToast();
  
  const donationAmounts = [10, 25, 50, 100, 250, 500];
  
  const rescueOrganizations: RescueOrganization[] = [
    {
      id: '1',
      name: 'Golden Hearts Rescue',
      location: 'Los Angeles, CA',
      description: 'Dedicated to rescuing Golden Retrievers and Labradors from high-kill shelters.',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
      rating: 4.9,
      totalRescued: 847,
      currentNeed: 'Medical care for 12 rescued puppies',
      fundingGoal: 5000,
      currentFunding: 3200,
      verified: true,
      tags: ['Golden Retriever', 'Labrador', 'Medical Care']
    },
    {
      id: '2',
      name: 'Second Chance Shelter',
      location: 'Austin, TX',
      description: 'No-kill shelter providing sanctuary for dogs of all breeds and ages.',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
      rating: 4.7,
      totalRescued: 1230,
      currentNeed: 'Emergency medical fund for senior dogs',
      fundingGoal: 8000,
      currentFunding: 4500,
      verified: true,
      tags: ['All Breeds', 'Senior Dogs', 'No-Kill']
    },
    {
      id: '3',
      name: 'Pitbull Paradise Rescue',
      location: 'Miami, FL',
      description: 'Specialized rescue for pitbulls and bully breeds, fighting breed discrimination.',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
      rating: 4.8,
      totalRescued: 456,
      currentNeed: 'Facility expansion for more rescues',
      fundingGoal: 15000,
      currentFunding: 8200,
      verified: true,
      tags: ['Pitbull', 'Bully Breeds', 'Advocacy']
    }
  ];

  const emergencyAlerts = [
    {
      id: '1',
      title: 'Hurricane Relief - Florida Shelters',
      description: 'Multiple shelters need immediate help evacuating and caring for 200+ dogs',
      urgency: 'critical',
      needed: 25000,
      raised: 8400,
      timeLeft: '2 days'
    },
    {
      id: '2',
      title: 'Puppy Mill Rescue - 50 Dogs',
      description: 'Emergency rescue operation needs funds for medical care and rehabilitation',
      urgency: 'high',
      needed: 12000,
      raised: 7800,
      timeLeft: '5 days'
    }
  ];

  const impactStats = [
    {
      icon: Shield,
      title: 'Dogs Rescued',
      value: '2,847',
      description: 'This month through verified rescues',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Families Matched',
      value: '1,592',
      description: 'Successful adoptions facilitated',
      color: 'text-green-600'
    },
    {
      icon: Award,
      title: 'Rescue Partners',
      value: '89',
      description: 'Verified rescue organizations',
      color: 'text-purple-600'
    },
    {
      icon: Heart,
      title: 'Lives Saved',
      value: '15,643',
      description: 'Total dogs rescued to date',
      color: 'text-red-600'
    }
  ];

  const handleDonation = () => {
    const targetName = selectedRescue 
      ? rescueOrganizations.find(r => r.id === selectedRescue)?.name 
      : 'General Rescue Fund';
    
    toast({
      title: "Thank you for your donation!",
      description: `Your $${selectedAmount} donation to ${targetName} is being processed.`,
    });
  };

  const getRescueProgress = (rescue: RescueOrganization) => {
    return (rescue.currentFunding / rescue.fundingGoal) * 100;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Heart size={48} className="text-red-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Save Rescue Dogs</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your donation directly supports verified rescue organizations and shelters 
          working tirelessly to save dogs in need across the country.
        </p>
      </div>

      <Tabs defaultValue="donate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="donate">Donate Now</TabsTrigger>
          <TabsTrigger value="rescues">Find Rescues</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="impact">Our Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="donate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift size={20} className="text-red-500" />
                  Make a Donation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Donation Type */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Donation Type:</label>
                  <div className="space-y-2">
                    <Button
                      variant={donationType === 'general' ? "default" : "outline"}
                      className={`w-full justify-start ${donationType === 'general' ? 'bg-red-500 text-white' : ''}`}
                      onClick={() => setDonationType('general')}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      General Rescue Fund
                    </Button>
                    <Button
                      variant={donationType === 'specific' ? "default" : "outline"}
                      className={`w-full justify-start ${donationType === 'specific' ? 'bg-red-500 text-white' : ''}`}
                      onClick={() => setDonationType('specific')}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Specific Rescue Organization
                    </Button>
                  </div>
                </div>

                {/* Rescue Selection */}
                {donationType === 'specific' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Choose Rescue:</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {rescueOrganizations.map((rescue) => (
                        <Card 
                          key={rescue.id}
                          className={`cursor-pointer transition-all p-3 ${
                            selectedRescue === rescue.id ? 'border-red-500 bg-red-50' : 'hover:shadow-md'
                          }`}
                          onClick={() => setSelectedRescue(rescue.id)}
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={rescue.image} 
                              alt={rescue.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{rescue.name}</span>
                                {rescue.verified && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600">{rescue.location}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amount Selection */}
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
                    <Input
                      type="number"
                      value={selectedAmount}
                      onChange={(e) => setSelectedAmount(Number(e.target.value))}
                      className="flex-1"
                      placeholder="Custom amount"
                    />
                  </div>
                </div>

                <Button 
                  className="w-full bg-red-500 text-white hover:bg-red-600"
                  onClick={handleDonation}
                >
                  Donate ${selectedAmount}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  100% of donations go directly to rescue organizations
                </div>
              </CardContent>
            </Card>

            {/* Donation Impact */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-500" />
                    Your Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold text-green-800">$25 Donation</div>
                      <div className="text-sm text-green-600">Feeds a rescue dog for 2 weeks</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-800">$50 Donation</div>
                      <div className="text-sm text-blue-600">Covers vaccination for 2 puppies</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-semibold text-purple-800">$100 Donation</div>
                      <div className="text-sm text-purple-600">Supports emergency medical care</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Goal Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">$18,400</span>
                      <span className="text-gray-600">of $25,000</span>
                    </div>
                    <Progress value={73.6} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>73.6% complete</span>
                      <span>$6,600 to go</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rescues" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {rescueOrganizations.map((rescue) => (
              <Card key={rescue.id} className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={rescue.image} 
                    alt={rescue.name}
                    className="w-full h-48 object-cover"
                  />
                  {rescue.verified && (
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{rescue.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{rescue.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    {rescue.location}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{rescue.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Current Need:</span>
                      <span className="font-medium">{rescue.currentNeed}</span>
                    </div>
                    <Progress 
                      value={getRescueProgress(rescue)} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${rescue.currentFunding.toLocaleString()}</span>
                      <span>${rescue.fundingGoal.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {rescue.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full bg-red-500 text-white hover:bg-red-600"
                    onClick={() => {
                      setSelectedRescue(rescue.id);
                      setDonationType('specific');
                    }}
                  >
                    Donate to {rescue.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">Emergency Alerts</h3>
            <p className="text-red-600 text-sm">
              These rescue operations need immediate support. Every donation helps save lives.
            </p>
          </div>

          <div className="space-y-4">
            {emergencyAlerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{alert.title}</h3>
                        <Badge className={`${getUrgencyColor(alert.urgency)} text-white`}>
                          {alert.urgency.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{alert.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress:</span>
                          <span className="font-medium">
                            ${alert.raised.toLocaleString()} / ${alert.needed.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={(alert.raised / alert.needed) * 100} 
                          className="h-2" 
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{Math.round((alert.raised / alert.needed) * 100)}% funded</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {alert.timeLeft} left
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="ml-4 bg-red-500 text-white hover:bg-red-600">
                      Donate Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <Icon size={32} className={`${stat.color} mx-auto mb-3`} />
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-700 mb-1">{stat.title}</div>
                    <div className="text-xs text-gray-500">{stat.description}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Success Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-green-50 rounded-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=80&h=80&fit=crop" 
                    alt="Rescued dog" 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold text-green-800">Max's Medical Fund - Completed!</h4>
                    <p className="text-sm text-green-600 mb-2">
                      Thanks to 127 donors, Max received life-saving surgery and is now healthy!
                    </p>
                    <Badge className="bg-green-500 text-white">$3,200 raised</Badge>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop" 
                    alt="Rescued dogs" 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold text-blue-800">Hurricane Rescue - 45 Dogs Saved!</h4>
                    <p className="text-sm text-blue-600 mb-2">
                      Emergency evacuation fund helped save 45 dogs from hurricane flooding.
                    </p>
                    <Badge className="bg-blue-500 text-white">$8,500 raised</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RescueDonationCenter;
