
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
    <div className="px-6 py-6 bg-white">
      {/* Profile Avatar and Basic Info */}
      <div className="flex items-start space-x-6 mb-6">
        {/* Large Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        {/* Name, Stats and Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              {isVerified && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            {/* Stats Row */}
            <div className="flex space-x-8 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{stats.posts}</div>
                <div className="text-gray-600 text-sm">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{stats.followers.toLocaleString()}</div>
                <div className="text-gray-600 text-sm">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{stats.following}</div>
                <div className="text-gray-600 text-sm">Following</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio and Location */}
      <div className="space-y-3">
        {bio && (
          <p className="text-gray-800 text-base leading-relaxed">{bio}</p>
        )}
        
        {location && (
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{location}</span>
          </div>
        )}
        
        {/* Verification Badges */}
        <div className="flex flex-wrap gap-2">
          {isVerified && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified Breeder
            </Badge>
          )}
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            Adoption Activity
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
