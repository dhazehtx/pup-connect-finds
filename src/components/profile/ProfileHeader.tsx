
import React from 'react';
import { MapPin, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProfileHeaderProps {
  displayName: string;
  location?: string;
  bio?: string;
  isVerified?: boolean;
  avatarUrl?: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
}

const ProfileHeader = ({ 
  displayName, 
  location, 
  bio, 
  isVerified, 
  avatarUrl,
  stats 
}: ProfileHeaderProps) => {
  return (
    <div className="px-4 py-6 bg-white">
      {/* Profile Avatar and Stats Row */}
      <div className="flex items-start space-x-6 mb-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex-1">
          <div className="flex justify-around text-center">
            <div>
              <div className="font-bold text-xl text-gray-900">{stats.posts}</div>
              <div className="text-gray-600 text-sm">Posts</div>
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">{stats.followers.toLocaleString()}</div>
              <div className="text-gray-600 text-sm">Followers</div>
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">{stats.following}</div>
              <div className="text-gray-600 text-sm">Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-gray-900">{displayName}</h2>
          {isVerified && (
            <Badge variant="verified" className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Verified Breeder</span>
            </Badge>
          )}
        </div>
        
        {location && (
          <div className="flex items-center space-x-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{location}</span>
          </div>
        )}
        
        {bio && (
          <p className="text-gray-700 text-sm leading-relaxed">{bio}</p>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
