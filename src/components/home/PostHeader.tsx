
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PostContextMenu from './PostContextMenu';

interface User {
  id: string;
  username: string;
  name: string;
  location: string;
  avatar: string;
}

interface Post {
  id: number;
  postUuid: string;
  user: User;
  image: string;
  likes: number;
  isLiked: boolean;
  caption: string;
  timeAgo: string;
}

interface PostHeaderProps {
  user: User;
  post: Post;
  onProfileClick: (userId: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
}

const PostHeader = ({ user, post, onProfileClick, onEdit, onDelete }: PostHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar 
          className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onProfileClick(user.id)}
        >
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <button
            onClick={() => onProfileClick(user.id)}
            className="font-semibold text-sm hover:opacity-70 transition-opacity text-left"
          >
            {user.username}
          </button>
          <span className="text-xs text-gray-500">{user.location}</span>
        </div>
      </div>

      <PostContextMenu 
        post={post}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default PostHeader;
