
import React from 'react';
import { MapPin, Calendar, CheckCircle, Star, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ProfilePreviewProps {
  formData: {
    fullName?: string;
    username?: string;
    bio?: string;
    location?: string;
    avatarUrl?: string;
    userType?: string;
    yearsExperience?: number;
  };
}

const ProfilePreview = ({ formData }: ProfilePreviewProps) => {
  const displayName = formData.fullName || 'Your Name';
  const displayUsername = formData.username ? `@${formData.username}` : '@username';
  const displayLocation = formData.location || 'Your Location';
  const displayBio = formData.bio || 'Add a bio to tell people about yourself...';

  return (
    <div className="p-4 bg-gray-50" style={{ border: 'none', outline: 'none' }}>
      <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
      
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="w-16 h-16">
          <AvatarImage src={formData.avatarUrl} alt={displayName} />
          <AvatarFallback>
            <User size={24} />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm text-black">{displayName}</h4>
            {formData.userType === 'breeder' && (
              <Badge className="bg-green-500 text-white text-xs">
                <CheckCircle size={8} className="mr-1" />
                Verified Breeder
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600">{displayUsername}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-1">
          <Star size={12} className="text-blue-500 fill-current" />
          <span className="font-medium">0.0</span>
          <span className="text-gray-600">(0 reviews)</span>
        </div>

        <p className="text-gray-600 text-xs">{displayBio}</p>
        
        <div className="flex items-center gap-1 text-gray-600 text-xs">
          <MapPin size={10} />
          {displayLocation}
        </div>

        {formData.userType === 'breeder' && (
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <Calendar size={10} />
            {formData.yearsExperience || 0} years experience
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePreview;
