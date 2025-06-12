
import React from 'react';
import { Button } from '@/components/ui/button';
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
        <img
          src={user.avatar}
          alt={user.username}
          className="w-8 h-8 rounded-full object-cover"
        />
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
