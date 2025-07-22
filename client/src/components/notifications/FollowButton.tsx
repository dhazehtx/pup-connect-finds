
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
          ? 'bg-cloud-white border-soft-sky text-deep-navy hover:bg-soft-sky' 
          : 'bg-royal-blue text-cloud-white hover:bg-deep-navy'
      }`}
      onClick={() => onToggle(username)}
    >
      {isFollowing ? 'Following' : 'Follow back'}
    </Button>
  );
};

export default FollowButton;
