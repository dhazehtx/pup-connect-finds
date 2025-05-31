
import React from 'react';
import { MapPin, Calendar, CheckCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import UserAvatarWithPresence from '@/components/ui/user-avatar-with-presence';
import { UserProfile } from '@/types/profile';

interface ProfileHeaderWithPresenceProps {
  profile: UserProfile;
}

const ProfileHeaderWithPresence = ({ profile }: ProfileHeaderWithPresenceProps) => {
  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <>
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <UserAvatarWithPresence
            userId={profile.id}
            username={profile.full_name || profile.username}
            avatarUrl={profile.avatar_url}
            size="lg"
            className="w-20 h-20"
          />
        </div>
        <div className="flex-1">
          <div className="flex gap-6 text-center">
            <div>
              <div className="font-semibold text-black">{profile.stats?.posts || 0}</div>
              <div className="text-gray-600 text-sm">Posts</div>
            </div>
            <div>
              <div className="font-semibold text-black">{(profile.stats?.followers || 0).toLocaleString()}</div>
              <div className="text-gray-600 text-sm">Followers</div>
            </div>
            <div>
              <div className="font-semibold text-black">{profile.stats?.following || 0}</div>
              <div className="text-gray-600 text-sm">Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-semibold text-sm text-black">{profile.full_name || profile.username}</h2>
          {profile.user_type === 'breeder' && (
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
            <span className="text-sm font-medium text-black">{profile.rating || 0}</span>
          </div>
          <span className="text-sm text-gray-600">({profile.total_reviews || 0} reviews)</span>
        </div>

        {profile.bio && (
          <p className="text-sm text-gray-600 mb-2">{profile.bio}</p>
        )}
        
        {profile.location && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPin size={12} />
            {profile.location}
          </div>
        )}

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <Calendar size={12} />
          {profile.years_experience || 0} years experience
        </div>
      </div>
    </>
  );
};

export default ProfileHeaderWithPresence;
