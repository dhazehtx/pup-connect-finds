
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, UserPlus, UserCheck, Share, Eye, Edit } from 'lucide-react';
import { useFollowSystem } from '@/hooks/useFollowSystem';

interface ProfileActionsProps {
  isOwnProfile: boolean;
  profileUserId: string;
  onMessage?: () => void;
  onShare?: () => void;
  onEditProfile?: () => void;
  onVisitListings?: () => void;
}

const ProfileActions = ({ 
  isOwnProfile, 
  profileUserId,
  onMessage, 
  onShare,
  onEditProfile,
  onVisitListings
}: ProfileActionsProps) => {
  const { isFollowing, followUser, unfollowUser } = useFollowSystem(profileUserId);

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowUser(profileUserId);
    } else {
      await followUser(profileUserId);
    }
  };

  if (isOwnProfile) {
    return (
      <div className="px-6 mb-6">
        <div className="flex space-x-3 mb-3">
          <Button 
            variant="outline" 
            className="flex-1 h-10 rounded-lg"
            onClick={onEditProfile}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="outline" className="h-10 px-4 rounded-lg" onClick={onShare}>
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 mb-6">
      <div className="flex space-x-3 mb-3">
        <Button 
          onClick={onMessage}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-lg font-medium"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
        <Button 
          variant={isFollowing ? "outline" : "default"}
          onClick={handleFollowToggle}
          className="flex-1 h-10 rounded-lg font-medium"
        >
          {isFollowing ? (
            <>
              <UserCheck className="w-4 h-4 mr-2" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Follow
            </>
          )}
        </Button>
      </div>
      
      <div>
        <Button 
          variant="outline" 
          className="w-full h-10 rounded-lg font-medium"
          onClick={onVisitListings}
        >
          <Eye className="w-4 h-4 mr-2" />
          Visit Listings
        </Button>
      </div>
    </div>
  );
};

export default ProfileActions;
