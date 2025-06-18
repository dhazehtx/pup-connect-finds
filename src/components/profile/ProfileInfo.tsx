
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface ProfileInfoProps {
  displayName: string;
  isGuest: boolean;
  isCurrentUser: boolean;
  isPublicView: boolean;
  userBadges: Array<{ name: string; color: string }>;
}

const ProfileInfo = ({ displayName, isGuest, isCurrentUser, isPublicView, userBadges }: ProfileInfoProps) => {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-100">
          <img 
            src="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=200&h=200&fit=crop&crop=face" 
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>
        {!isGuest && (!isCurrentUser || isPublicView) && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 mb-1">{displayName}</h2>
      
      {/* Bio */}
      <div className="text-center mb-4">
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          {isCurrentUser && !isPublicView
            ? "Connecting happy, healthy puppies with loving families 🐾" 
            : "Passionate breeder specializing in Golden Retrievers and Labradors. 🐾 Raising healthy, happy puppies with love."
          }
        </p>
        
        {/* Location */}
        <div className="flex items-center justify-center space-x-1 text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">Location Tag, USA</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {userBadges.map((badge, index) => (
          <Badge key={index} className={`text-xs ${badge.color} border-0`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {badge.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ProfileInfo;
