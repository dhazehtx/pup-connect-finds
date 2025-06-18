
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, UserPlus, Eye, Share } from 'lucide-react';

interface ProfileActionsProps {
  isOwnProfile: boolean;
  onMessage?: () => void;
  onFollow?: () => void;
  onShare?: () => void;
}

const ProfileActions = ({ 
  isOwnProfile, 
  onMessage, 
  onFollow, 
  onShare 
}: ProfileActionsProps) => {
  if (isOwnProfile) {
    return (
      <div className="px-4 mb-6">
        <div className="flex space-x-2">
          <Link to="/edit-profile" className="flex-1">
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </Link>
          <Button variant="outline" onClick={onShare}>
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mb-6">
      <div className="flex space-x-2">
        <Button 
          onClick={onMessage}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
        <Button 
          variant="outline" 
          onClick={onFollow}
          className="flex-1"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </Button>
        <Link to="/explore">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Visit Listings
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProfileActions;
