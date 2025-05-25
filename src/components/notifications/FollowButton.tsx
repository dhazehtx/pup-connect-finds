
import React from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FollowButtonProps {
  username: string;
  isFollowing: boolean;
  onToggle: (username: string) => void;
}

const FollowButton = ({ username, isFollowing, onToggle }: FollowButtonProps) => {
  return (
    <Button
      size="sm"
      variant={isFollowing ? "outline" : "default"}
      className={`h-7 px-3 text-xs rounded-md ${
        isFollowing 
          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
      onClick={() => onToggle(username)}
    >
      {isFollowing ? 'Following' : 'Follow back'}
    </Button>
  );
};

export default FollowButton;
