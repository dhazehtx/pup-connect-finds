
import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronRight, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';

interface ProfileStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  action?: () => void;
}

interface ProfileCompletionGuideProps {
  profile: any;
  onStepClick?: (stepId: string) => void;
  onDismiss?: () => void;
  className?: string;
}

const ProfileCompletionGuide = ({ 
  profile, 
  onStepClick, 
  onDismiss,
  className 
}: ProfileCompletionGuideProps) => {
  const { isMobile } = useMobileOptimized();
  const [isExpanded, setIsExpanded] = useState(false);

  const steps: ProfileStep[] = [
    {
      id: 'basic_info',
      title: 'Complete Basic Information',
      description: 'Add your full name and bio',
      completed: !!(profile?.full_name && profile?.bio),
      required: true
    },
    {
      id: 'profile_photo',
      title: 'Add Profile Photo',
      description: 'Upload a clear profile picture',
      completed: !!profile?.avatar_url,
      required: true
    },
    {
      id: 'contact_info',
      title: 'Add Contact Information',
      description: 'Add phone number and location',
      completed: !!(profile?.phone && profile?.location),
      required: false
    },
    {
      id: 'verification',
      title: 'Get Verified',
      description: 'Submit verification documents',
      completed: !!profile?.verified,
      required: false
    },
    {
      id: 'social_links',
      title: 'Connect Social Media',
      description: 'Add your social media profiles',
      completed: !!(profile?.social_links && Object.keys(profile.social_links).length > 0),
      required: false
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  const isComplete = completionPercentage === 100;

  if (isComplete) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Profile Complete! 🎉</h3>
              <p className="text-sm text-green-700">
                Your profile is fully optimized to attract more connections.
              </p>
            </div>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                <X size={16} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              Complete Your Profile
              <Badge variant="outline" className="text-xs">
                {completedSteps}/{totalSteps}
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {completionPercentage}% complete • Improve your visibility
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronRight 
                size={16} 
                className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </Button>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
        <Progress value={completionPercentage} className="h-2 mt-2" />
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  step.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'hover:bg-gray-50 cursor-pointer border-gray-200'
                }`}
                onClick={() => !step.completed && onStepClick?.(step.id)}
              >
                <div className="mt-0.5">
                  {step.completed ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <Circle size={16} className="text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-medium ${
                      step.completed ? 'text-green-800' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h4>
                    {step.required && !step.completed && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className={`text-xs ${
                    step.completed ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                </div>

                {!step.completed && (
                  <ChevronRight size={14} className="text-gray-400 mt-1" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ProfileCompletionGuide;
