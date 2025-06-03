
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  User, 
  Camera, 
  Shield, 
  MapPin, 
  Phone, 
  Globe,
  Star,
  X
} from 'lucide-react';

interface EnhancedProfileData {
  full_name?: string;
  username?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website_url?: string;
  avatar_url?: string;
  verified?: boolean;
  trust_score?: number;
  profile_completion_percentage?: number;
  specializations?: string[];
}

interface ProfileCompletionGuideEnhancedProps {
  profile: EnhancedProfileData;
  onStepClick: (stepId: string) => void;
  onDismiss: () => void;
}

const ProfileCompletionGuideEnhanced = ({ 
  profile, 
  onStepClick, 
  onDismiss 
}: ProfileCompletionGuideEnhancedProps) => {
  const completionSteps = [
    {
      id: 'basic_info',
      title: 'Basic Information',
      description: 'Add your name and bio',
      icon: User,
      completed: !!(profile.full_name && profile.bio),
      points: 20
    },
    {
      id: 'profile_photo',
      title: 'Profile Photo',
      description: 'Upload your photo',
      icon: Camera,
      completed: !!profile.avatar_url,
      points: 15
    },
    {
      id: 'location',
      title: 'Location',
      description: 'Add your location',
      icon: MapPin,
      completed: !!profile.location,
      points: 10
    },
    {
      id: 'contact',
      title: 'Contact Info',
      description: 'Add phone and website',
      icon: Phone,
      completed: !!(profile.phone || profile.website_url),
      points: 15
    },
    {
      id: 'specializations',
      title: 'Specializations',
      description: 'Add your expertise',
      icon: Star,
      completed: !!(profile.specializations && profile.specializations.length > 0),
      points: 20
    },
    {
      id: 'verification',
      title: 'Get Verified',
      description: 'Verify your identity',
      icon: Shield,
      completed: !!profile.verified,
      points: 20
    }
  ];

  const completedSteps = completionSteps.filter(step => step.completed);
  const totalPoints = completionSteps.reduce((sum, step) => sum + step.points, 0);
  const earnedPoints = completedSteps.reduce((sum, step) => sum + step.points, 0);
  const completionPercentage = profile.profile_completion_percentage || Math.round((earnedPoints / totalPoints) * 100);

  if (completionPercentage >= 90) {
    return null; // Don't show guide when profile is mostly complete
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-600" />
            Complete Your Profile
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {completionPercentage}% Complete
            </span>
            <div className="flex items-center gap-2">
              {profile.trust_score && (
                <Badge variant="outline" className="text-xs">
                  Trust: {(profile.trust_score * 100).toFixed(0)}%
                </Badge>
              )}
              <span className="text-gray-600">
                {earnedPoints}/{totalPoints} points
              </span>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {completionSteps.map((step) => {
            const IconComponent = step.icon;
            return (
              <Button
                key={step.id}
                variant={step.completed ? "outline" : "secondary"}
                size="sm"
                className={`h-auto p-3 flex flex-col items-center gap-2 ${
                  step.completed ? 'bg-green-50 border-green-200' : ''
                }`}
                onClick={() => !step.completed && onStepClick(step.id)}
                disabled={step.completed}
              >
                <div className="flex items-center gap-2">
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <IconComponent className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">{step.title}</span>
                </div>
                <span className="text-xs text-gray-600 text-center">
                  {step.description}
                </span>
                <Badge variant="secondary" className="text-xs">
                  +{step.points} pts
                </Badge>
              </Button>
            );
          })}
        </div>

        <div className="text-xs text-gray-600 text-center">
          Complete your profile to improve visibility and trust with other users
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionGuideEnhanced;
