
import React from 'react';
import { Shield, Star, Award, CheckCircle, Crown, Briefcase, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfileBadge {
  id: string;
  type: 'verification' | 'professional' | 'premium' | 'achievement';
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  earned_at?: string;
  expires_at?: string;
}

interface ProfileBadgeSystemProps {
  userId: string;
  userType: 'buyer' | 'breeder' | 'shelter' | 'admin';
  professionalStatus?: 'standard' | 'professional' | 'verified_professional';
  subscriptionTier?: 'basic' | 'pro' | 'enterprise';
  customBadges?: ProfileBadge[];
}

const ProfileBadgeSystem = ({ 
  userId, 
  userType, 
  professionalStatus = 'standard',
  subscriptionTier,
  customBadges = []
}: ProfileBadgeSystemProps) => {
  
  const getDefaultBadges = (): ProfileBadge[] => {
    const badges: ProfileBadge[] = [];

    // Verification badges
    if (professionalStatus === 'verified_professional') {
      badges.push({
        id: 'verified_professional',
        type: 'verification',
        name: 'Verified Professional',
        description: 'Licensed and verified professional with background checks',
        icon: Shield,
        color: 'text-blue-800',
        bgColor: 'bg-blue-100',
        earned_at: new Date().toISOString()
      });
    } else if (professionalStatus === 'professional') {
      badges.push({
        id: 'professional',
        type: 'professional',
        name: 'Professional',
        description: 'Verified business account with professional credentials',
        icon: Briefcase,
        color: 'text-green-800',
        bgColor: 'bg-green-100',
        earned_at: new Date().toISOString()
      });
    }

    // Subscription badges
    if (subscriptionTier === 'enterprise') {
      badges.push({
        id: 'enterprise_member',
        type: 'premium',
        name: 'Enterprise Member',
        description: 'Premium enterprise account with advanced features',
        icon: Crown,
        color: 'text-purple-800',
        bgColor: 'bg-purple-100',
        earned_at: new Date().toISOString()
      });
    } else if (subscriptionTier === 'pro') {
      badges.push({
        id: 'pro_member',
        type: 'premium',
        name: 'Pro Member',
        description: 'Pro account with enhanced features and analytics',
        icon: Star,
        color: 'text-yellow-800',
        bgColor: 'bg-yellow-100',
        earned_at: new Date().toISOString()
      });
    }

    // User type badges
    if (userType === 'breeder') {
      badges.push({
        id: 'breeder',
        type: 'achievement',
        name: 'Registered Breeder',
        description: 'Verified dog breeder with professional credentials',
        icon: Award,
        color: 'text-indigo-800',
        bgColor: 'bg-indigo-100',
        earned_at: new Date().toISOString()
      });
    } else if (userType === 'shelter') {
      badges.push({
        id: 'shelter',
        type: 'achievement',
        name: 'Rescue Organization',
        description: 'Verified animal rescue or shelter organization',
        icon: Heart,
        color: 'text-red-800',
        bgColor: 'bg-red-100',
        earned_at: new Date().toISOString()
      });
    }

    return badges;
  };

  const allBadges = [...getDefaultBadges(), ...customBadges];

  if (allBadges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        {allBadges.map((badge) => {
          const IconComponent = badge.icon;
          const isExpired = badge.expires_at && new Date(badge.expires_at) < new Date();
          
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger>
                <Badge 
                  variant="outline" 
                  className={`${badge.bgColor} ${badge.color} border-current flex items-center gap-1 ${
                    isExpired ? 'opacity-50' : ''
                  }`}
                >
                  <IconComponent size={12} />
                  {badge.name}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-sm">{badge.description}</p>
                  {badge.earned_at && (
                    <p className="text-xs mt-1 opacity-75">
                      Earned {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  )}
                  {isExpired && (
                    <p className="text-xs mt-1 text-red-600">Expired</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
};

export default ProfileBadgeSystem;
