
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';

interface PostHeaderProps {
  user: {
    id: string;
    username: string;
    name: string;
    location: string;
    avatar: string;
  };
  onProfileClick: (userId: string) => void;
}

const PostHeader = ({ user, onProfileClick }: PostHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-3">
      <div 
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => onProfileClick(user.id)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-xs">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm hover:underline">{user.username}</p>
          <p className="text-xs text-gray-500">{user.location}</p>
        </div>
      </div>
      <Button variant="ghost" size="sm">
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default PostHeader;
