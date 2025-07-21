
import React from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  isFollowing?: boolean;
}

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  likedBy?: User[];
}

interface Post {
  id: string;
  postUuid: string;
  user: {
    id: string;
    username: string;
    name: string;
    location: string;
    avatar: string;
  };
  image: string;
  likes: number;
  isLiked: boolean;
  caption: string;
  timeAgo: string;
  likedBy: User[];
  comments: Comment[];
}

interface PostHeaderProps {
  user: {
    id: string;
    username: string;
    name: string;
    location: string;
    avatar: string;
  };
  post: Post;
  onProfileClick: (userId: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
}

const PostHeader = ({ user, post, onProfileClick, onEdit, onDelete }: PostHeaderProps) => {
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.id === user.id;

  const handleProfileClick = () => {
    onProfileClick(user.id);
  };

  const handleEdit = () => {
    onEdit(post);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post.postUuid);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div 
          className="w-8 h-8 rounded-full cursor-pointer overflow-hidden"
          onClick={handleProfileClick}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 
              className="font-semibold text-sm cursor-pointer hover:underline"
              onClick={handleProfileClick}
            >
              {user.username}
            </h3>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>{user.location}</span>
          </div>
        </div>
      </div>

      {isOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default PostHeader;
