
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Share, Eye, Edit } from 'lucide-react';

interface ProfileActionButtonsProps {
  isCurrentUser: boolean;
  isPublicView: boolean;
  isFollowing: boolean;
  onEditProfile: () => void;
  onSettings: () => void;
  onShare: () => void;
  onViewPublicProfile: () => void;
  onMessage: () => void;
  onFollow: () => void;
}

const ProfileActionButtons = ({
  isCurrentUser,
  isPublicView,
  isFollowing,
  onEditProfile,
  onSettings,
  onShare,
  onViewPublicProfile,
  onMessage,
  onFollow
}: ProfileActionButtonsProps) => {
  if (isCurrentUser && !isPublicView) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Button 
            onClick={onEditProfile}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl font-medium"
          >
            Edit Profile
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={onSettings}
            className="h-12 w-12 rounded-xl border-gray-300"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={onShare}
            className="flex-1 h-10 rounded-xl border-gray-300"
          >
            <Share className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
          <Button 
            variant="outline" 
            onClick={onViewPublicProfile}
            className="flex-1 h-10 rounded-xl border-gray-300"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Public
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex space-x-3">
        <Button 
          onClick={onMessage}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl font-medium"
        >
          Message
        </Button>
        <Button 
          variant="outline" 
          onClick={onShare}
          className="h-12 px-6 rounded-xl border-gray-300 font-medium"
        >
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button 
          variant={isFollowing ? "outline" : "default"}
          onClick={onFollow}
          className="flex-1 h-12 rounded-xl font-medium"
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileActionButtons;
