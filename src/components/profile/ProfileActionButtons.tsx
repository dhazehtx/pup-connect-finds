
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Share, Eye } from 'lucide-react';

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
      <div className="space-y-4 mb-8">
        <div className="px-4">
          <div className="flex items-center space-x-3">
            <Button 
              onClick={onEditProfile}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl font-semibold text-base"
            >
              Edit Profile
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={onSettings}
              className="h-12 w-12 rounded-xl border-gray-300 bg-white hover:bg-gray-50"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-3 px-4">
          <Button 
            variant="outline" 
            onClick={onShare}
            className="flex-1 h-11 rounded-xl border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 shadow-sm"
          >
            <Share className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
          <Button 
            variant="outline" 
            onClick={onViewPublicProfile}
            className="flex-1 h-11 rounded-xl border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 shadow-sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Public
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="flex space-x-3 px-4">
        <Button 
          onClick={onMessage}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl font-semibold text-base"
        >
          Message
        </Button>
        <Button 
          variant={isFollowing ? "outline" : "default"}
          onClick={onFollow}
          className={`flex-1 h-12 rounded-xl font-semibold text-base ${
            isFollowing 
              ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
      <div className="px-4">
        <Button 
          variant="outline" 
          onClick={onShare}
          className="w-full h-11 rounded-xl border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 shadow-sm"
        >
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default ProfileActionButtons;
