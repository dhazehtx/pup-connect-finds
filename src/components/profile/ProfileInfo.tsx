
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
    <div className="flex flex-col items-center mb-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100">
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
      
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{displayName}</h2>
        <p className="text-gray-600 text-sm">@{displayName.toLowerCase().replace(/\s+/g, '')}</p>
      </div>
    </div>
  );
};

export default ProfileInfo;
