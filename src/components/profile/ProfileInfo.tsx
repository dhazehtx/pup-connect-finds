
import React from 'react';
import { MapPin, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProfileInfoProps {
  bio: string;
  location?: string;
  website_url?: string;
  specializations: string[];
}

const ProfileInfo = ({ bio, location, website_url, specializations }: ProfileInfoProps) => {
  return (
    <div className="py-4 space-y-3">
      <p className="text-sm">{bio}</p>
      
      {location && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
      )}
      
      {website_url && (
        <div className="flex items-center space-x-2 text-sm text-blue-600">
          <Globe className="w-4 h-4" />
          <a href={website_url} target="_blank" rel="noopener noreferrer">
            {website_url}
          </a>
        </div>
      )}

      {specializations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {spec}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
