
import React from 'react';
import { Shield, Star, Award, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ProfileBadgeSystem from './ProfileBadgeSystem';

interface ProfileBadgesProps {
  verificationBadges: string[];
  specializations: string[];
  certifications?: string[];
  userId: string;
  userType: 'buyer' | 'breeder' | 'shelter' | 'admin';
  professionalStatus?: 'standard' | 'professional' | 'verified_professional';
  subscriptionTier?: 'basic' | 'pro' | 'enterprise';
}

const ProfileBadges = ({ 
  verificationBadges, 
  specializations, 
  certifications = [],
  userId,
  userType,
  professionalStatus,
  subscriptionTier
}: ProfileBadgesProps) => {
  const getBadgeIcon = (badgeType: string) => {
    if (badgeType.toLowerCase().includes('verified') || badgeType.toLowerCase().includes('id')) {
      return Shield;
    }
    if (badgeType.toLowerCase().includes('license') || badgeType.toLowerCase().includes('business')) {
      return CheckCircle;
    }
    if (badgeType.toLowerCase().includes('vet') || badgeType.toLowerCase().includes('health')) {
      return Award;
    }
    return Star;
  };

  const getBadgeColor = (badgeType: string) => {
    if (badgeType.toLowerCase().includes('verified') || badgeType.toLowerCase().includes('id')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (badgeType.toLowerCase().includes('license') || badgeType.toLowerCase().includes('business')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (badgeType.toLowerCase().includes('vet') || badgeType.toLowerCase().includes('health')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div className="space-y-4">
      {/* New Profile Badge System */}
      <ProfileBadgeSystem
        userId={userId}
        userType={userType}
        professionalStatus={professionalStatus}
        subscriptionTier={subscriptionTier}
      />

      {/* Legacy Verification Badges */}
      {verificationBadges.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {verificationBadges.map((badge, index) => {
            const IconComponent = getBadgeIcon(badge);
            return (
              <Badge 
                key={index} 
                className={`text-xs ${getBadgeColor(badge)}`}
                variant="outline"
              >
                <IconComponent size={10} className="mr-1" />
                {badge}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Specializations */}
      {specializations.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1 text-black">Specializes in:</h4>
          <div className="flex flex-wrap gap-1">
            {specializations.map((spec, index) => (
              <Badge key={index} className="text-xs bg-blue-500 text-white">
                {spec}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1 text-black">Certifications:</h4>
          <div className="flex flex-wrap gap-1">
            {certifications.map((cert, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Award size={10} className="mr-1" />
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBadges;
