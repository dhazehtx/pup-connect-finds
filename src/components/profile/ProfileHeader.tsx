
import React from 'react';
import { MapPin, Calendar, CheckCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProfileHeaderProps {
  profile: {
    name: string;
    username: string;
    location: string;
    bio: string;
    avatar: string;
    followers: number;
    following: number;
    posts: number;
    verified: boolean;
    isBreeder: boolean;
    rating: number;
    totalReviews: number;
    yearsExperience: number;
  };
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  return (
    <>
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          {profile.verified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
              <CheckCircle size={16} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex gap-6 text-center">
            <div>
              <div className="font-semibold text-black">{profile.posts}</div>
              <div className="text-gray-600 text-sm">Posts</div>
            </div>
            <div>
              <div className="font-semibold text-black">{profile.followers.toLocaleString()}</div>
              <div className="text-gray-600 text-sm">Followers</div>
            </div>
            <div>
              <div className="font-semibold text-black">{profile.following}</div>
              <div className="text-gray-600 text-sm">Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-semibold text-sm text-black">{profile.name}</h2>
          {profile.isBreeder && (
            <Badge className="bg-green-500 text-white text-xs">
              <CheckCircle size={10} className="mr-1" />
              Verified Breeder
            </Badge>
          )}
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-blue-500 fill-current" />
            <span className="text-sm font-medium text-black">{profile.rating}</span>
          </div>
          <span className="text-sm text-gray-600">({profile.totalReviews} reviews)</span>
        </div>

        <p className="text-sm text-gray-600 mb-2">{profile.bio}</p>
        
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <MapPin size={12} />
          {profile.location}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <Calendar size={12} />
          {profile.yearsExperience} years experience
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
