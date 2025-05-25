
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
      className="h-6 px-2 text-xs"
      onClick={() => onToggle(username)}
    >
      {isFollowing ? (
        <>
          <UserCheck size={12} className="mr-1" />
          Following
        </>
      ) : (
        <>
          <UserPlus size={12} className="mr-1" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;
