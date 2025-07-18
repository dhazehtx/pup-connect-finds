
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
          className="w-8 h-8 cursor-pointer"
          onClick={() => onProfileClick(user.id)}
        >
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div>
          <p 
            className="font-semibold text-sm cursor-pointer hover:underline"
            onClick={() => onProfileClick(user.id)}
          >
            {user.username}
          </p>
          <p className="text-xs text-gray-500">{user.location}</p>
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
