
import React from 'react';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProfileBadgesProps {
  verificationBadges: string[];
  specializations: string[];
}

const ProfileBadges = ({ verificationBadges, specializations }: ProfileBadgesProps) => {
  return (
    <>
      {/* Verification Badges */}
      <div className="flex flex-wrap gap-1 mb-3">
        {verificationBadges.map((badge, index) => (
          <Badge key={index} className="text-xs bg-blue-100 text-blue-800 border-blue-200">
            <Shield size={10} className="mr-1" />
            {badge}
          </Badge>
        ))}
      </div>

      {/* Specializations */}
      <div className="mb-3">
        <h4 className="text-sm font-medium mb-1">Specializes in:</h4>
        <div className="flex flex-wrap gap-1">
          {specializations.map((spec, index) => (
            <Badge key={index} className="text-xs bg-blue-500 text-white">
              {spec}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProfileBadges;
