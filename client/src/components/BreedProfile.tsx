
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Home, Users, Zap, Scissors, Brain, Shield } from 'lucide-react';

interface BreedProfileProps {
  breed: {
    name: string;
    description: string;
    image: string;
    size: 'Small' | 'Medium' | 'Large' | 'Extra Large';
    traits: {
      energyLevel: number;
      trainability: number;
      groomingNeeds: number;
      sheddingLevel: number;
      barkingLevel: number;
      sociability: number;
    };
    lifestyle: {
      goodWithKids: boolean;
      goodWithPets: boolean;
      apartmentFriendly: boolean;
      firstTimeOwner: boolean;
      lowMaintenance: boolean;
    };
    healthInfo: {
      lifespan: string;
      commonIssues: string[];
      exerciseNeeds: string;
    };
    careInfo: {
      groomingFrequency: string;
      exerciseTime: string;
      trainingDifficulty: string;
    };
  };
}

const BreedProfile = ({ breed }: BreedProfileProps) => {
  const getProgressColor = (value: number) => {
    if (value <= 3) return 'bg-green-500';
    if (value <= 7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const TraitBar = ({ label, value, icon: Icon }: { label: string; value: number; icon: any }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-gray-600" />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-500 ml-auto">{value}/10</span>
      </div>
      <div className="relative">
        <Progress value={value * 10} className="h-2" />
        <div 
          className={`absolute top-0 left-0 h-2 rounded-full ${getProgressColor(value)}`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );

  const LifestyleBadge = ({ label, suitable }: { label: string; suitable: boolean }) => (
    <Badge 
      variant={suitable ? "default" : "secondary"} 
      className={`text-xs ${suitable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
    >
      {suitable ? '✓' : '✗'} {label}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <img
              src={breed.image}
              alt={breed.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{breed.name}</h1>
              <Badge className="mb-3">{breed.size}</Badge>
              <p className="text-gray-600 text-sm leading-relaxed">{breed.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personality Traits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} />
            Personality Traits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TraitBar label="Energy Level" value={breed.traits.energyLevel} icon={Zap} />
          <TraitBar label="Trainability" value={breed.traits.trainability} icon={Brain} />
          <TraitBar label="Grooming Needs" value={breed.traits.groomingNeeds} icon={Scissors} />
          <TraitBar label="Shedding Level" value={breed.traits.sheddingLevel} icon={Home} />
          <TraitBar label="Barking Level" value={breed.traits.barkingLevel} icon={Shield} />
          <TraitBar label="Sociability" value={breed.traits.sociability} icon={Users} />
        </CardContent>
      </Card>

      {/* Lifestyle Compatibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home size={20} />
            Lifestyle Compatibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <LifestyleBadge label="Good with Kids" suitable={breed.lifestyle.goodWithKids} />
            <LifestyleBadge label="Good with Pets" suitable={breed.lifestyle.goodWithPets} />
            <LifestyleBadge label="Apartment Friendly" suitable={breed.lifestyle.apartmentFriendly} />
            <LifestyleBadge label="First-Time Owner" suitable={breed.lifestyle.firstTimeOwner} />
            <LifestyleBadge label="Low Maintenance" suitable={breed.lifestyle.lowMaintenance} />
          </div>
        </CardContent>
      </Card>

      {/* Health Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart size={20} />
            Health & Care
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Life Expectancy</h4>
            <p className="text-gray-600 text-sm">{breed.healthInfo.lifespan}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-2">Exercise Needs</h4>
            <p className="text-gray-600 text-sm">{breed.healthInfo.exerciseNeeds}</p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Common Health Issues</h4>
            <div className="flex flex-wrap gap-1">
              {breed.healthInfo.commonIssues.map((issue, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {issue}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Care Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Care Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Grooming</span>
            <span className="text-sm text-gray-600">{breed.careInfo.groomingFrequency}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Exercise Time</span>
            <span className="text-sm text-gray-600">{breed.careInfo.exerciseTime}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Training</span>
            <span className="text-sm text-gray-600">{breed.careInfo.trainingDifficulty}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BreedProfile;
