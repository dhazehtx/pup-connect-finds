
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';

interface PostUserInfoProps {
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isOwnPost: boolean;
  };
  timestamp: string;
  isFollowing: boolean;
  onProfileClick: (userId: string) => void;
  onFollowClick: () => void;
}

const PostUserInfo = ({ 
  user, 
  timestamp, 
  isFollowing, 
  onProfileClick, 
  onFollowClick 
}: PostUserInfoProps) => {
  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar 
        className="h-10 w-10 cursor-pointer" 
        onClick={() => onProfileClick(user.id)}
      >
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p 
          className="font-medium text-sm cursor-pointer hover:underline"
          onClick={() => onProfileClick(user.id)}
        >
          {user.name}
        </p>
        <p className="text-gray-600 text-xs">{timestamp}</p>
      </div>
      {!user.isOwnPost && (
        <Button 
          size="sm" 
          variant={isFollowing ? "outline" : "default"}
          onClick={onFollowClick}
          className={isFollowing ? "border-gray-300 text-gray-700" : ""}
        >
          {isFollowing ? (
            <>
              <UserCheck size={16} className="mr-1" />
              Following
            </>
          ) : (
            <>
              <UserPlus size={16} className="mr-1" />
              Follow
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default PostUserInfo;
