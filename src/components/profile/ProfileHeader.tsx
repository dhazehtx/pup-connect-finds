
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
  onStatsClick?: (type: 'posts' | 'followers' | 'following') => void;
}

const ProfileHeader = ({ 
  displayName, 
  location, 
  bio, 
  isVerified, 
  avatarUrl,
  stats,
  onStatsClick 
}: ProfileHeaderProps) => {
  return (
    <div className="px-6 py-6 bg-white">
      {/* Profile Avatar - Centered */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg mb-4">
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
        
        {/* Name and Verification */}
        <div className="flex items-center space-x-2 mb-2">
          <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
          {isVerified && (
            <CheckCircle className="w-5 h-5 text-blue-500" />
          )}
        </div>
        
        {/* Location */}
        {location && (
          <div className="flex items-center space-x-1 text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{location}</span>
          </div>
        )}
        
        {/* Bio */}
        {bio && (
          <p className="text-gray-700 text-center text-sm leading-relaxed mb-4 max-w-xs">{bio}</p>
        )}
        
        {/* Verification Badge */}
        {isVerified && (
          <Badge variant="verified" className="mb-4">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified Breeder
          </Badge>
        )}
      </div>

      {/* Stats Bar - Centered */}
      <div className="flex justify-center space-x-8 py-4 border-t border-gray-100">
        <button 
          onClick={() => onStatsClick?.('posts')}
          className="text-center hover:opacity-75 transition-opacity"
        >
          <div className="text-xl font-bold text-gray-900">{stats.posts}</div>
          <div className="text-gray-600 text-sm">Puppies Listed</div>
        </button>
        <button 
          onClick={() => onStatsClick?.('followers')}
          className="text-center hover:opacity-75 transition-opacity"
        >
          <div className="text-xl font-bold text-gray-900">{stats.followers.toLocaleString()}</div>
          <div className="text-gray-600 text-sm">Followers</div>
        </button>
        <button 
          onClick={() => onStatsClick?.('following')}
          className="text-center hover:opacity-75 transition-opacity"
        >
          <div className="text-xl font-bold text-gray-900">{stats.following}</div>
          <div className="text-gray-600 text-sm">Following</div>
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
