
import React from 'react';
import { Shield, Star, CheckCircle, Award, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserVerificationBadgeProps {
  verificationLevel: 'none' | 'basic' | 'premium' | 'professional';
  rating?: number;
  totalReviews?: number;
  memberSince?: string;
  className?: string;
}

const UserVerificationBadge = ({ 
  verificationLevel, 
  rating, 
  totalReviews, 
  memberSince,
  className 
}: UserVerificationBadgeProps) => {
  const getVerificationInfo = (level: string) => {
    switch (level) {
      case 'professional':
        return {
          icon: Award,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          label: 'Professional Breeder',
          description: 'Licensed breeder with health testing and breeding certifications'
        };
      case 'premium':
        return {
          icon: Shield,
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          label: 'Premium Verified',
          description: 'ID verified, background checked, and highly rated'
        };
      case 'basic':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-300',
          label: 'Verified',
          description: 'ID verified and phone confirmed'
        };
      default:
        return {
          icon: Clock,
          color: 'bg-gray-100 text-gray-600 border-gray-300',
          label: 'New User',
          description: 'Account created recently'
        };
    }
  };

  const verificationInfo = getVerificationInfo(verificationLevel);
  const IconComponent = verificationInfo.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`${verificationInfo.color} flex items-center gap-1`}>
              <IconComponent size={12} />
              {verificationInfo.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{verificationInfo.label}</p>
            <p className="text-sm">{verificationInfo.description}</p>
            {memberSince && (
              <p className="text-xs text-gray-500 mt-1">Member since {memberSince}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {rating && totalReviews && (
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-500 fill-current" />
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-500">({totalReviews})</span>
        </div>
      )}
    </div>
  );
};

export default UserVerificationBadge;
