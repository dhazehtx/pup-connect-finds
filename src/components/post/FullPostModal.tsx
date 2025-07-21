
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import CommentsModal from './CommentsModal';
import EditPostModal from '../home/EditPostModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface FullPostModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: (userId: string) => void;
  onPostUpdate?: (postId: string, newCaption: string) => void;
  onPostDelete?: (postId: string) => void;
}

const FullPostModal = ({ 
  post, 
  isOpen, 
  onClose, 
  onProfileClick,
  onPostUpdate,
  onPostDelete 
}: FullPostModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!post) return null;

  const isOwner = user?.id === post.user_id;

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleComment = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }
    setShowComments(true);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    toast({
      title: "Comment added!",
      description: "Your comment has been posted",
    });
    setNewComment('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddComment();
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onPostDelete?.(post.id);
      onClose();
    }
  };

  const handlePostUpdate = (postId: string, newCaption: string) => {
    onPostUpdate?.(postId, newCaption);
    setShowEditModal(false);
  };

  // Convert post format for EditPostModal
  const editPostData = {
    id: post.id,
    postUuid: post.id,
    user: {
      id: post.user_id,
      username: post.profiles?.username || post.profiles?.full_name || 'User',
      name: post.profiles?.full_name || post.profiles?.username || 'User',
      location: 'Location',
      avatar: post.profiles?.avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`
    },
    image: post.image_url || '',
    likes: 0,
    isLiked: false,
    caption: post.caption || '',
    timeAgo: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
    likedBy: [],
    comments: []
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`${isMobile ? 'max-w-full h-full m-0 rounded-none' : 'max-w-4xl max-h-[90vh]'} p-0 overflow-hidden`}>
          <div className={`${isMobile ? 'h-full' : 'max-h-[90vh]'} flex ${isMobile ? 'flex-col' : 'flex-row'}`}>
            {/* Image Section - Fixed mobile scaling */}
            <div className={`${isMobile ? 'flex-shrink-0' : 'flex-1'} bg-black flex items-center justify-center relative`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              >
                <X size={20} />
              </Button>
              
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={post.image_url}
                  alt="Post"
                  className={`
                    w-full h-auto object-contain
                    ${isMobile 
                      ? 'max-h-[50vh] min-h-[200px]' 
                      : 'max-h-[80vh]'
                    }
                  `}
                />
              </div>
            </div>

            {/* Content Section */}
            <div className={`${isMobile ? 'flex-1 min-h-0' : 'w-96'} bg-white flex flex-col`}>
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar 
                    className="h-8 w-8 cursor-pointer" 
                    onClick={() => onProfileClick(post.user_id)}
                  >
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>
                      {post.profiles?.full_name?.charAt(0) || post.profiles?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p 
                      className="font-medium text-sm cursor-pointer hover:underline"
                      onClick={() => onProfileClick(post.user_id)}
                    >
                      {post.profiles?.username || post.profiles?.full_name}
                    </p>
                  </div>
                </div>
                
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal size={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-4 mb-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLike}
                    className="p-0 h-auto hover:bg-transparent"
                  >
                    <Heart 
                      size={24} 
                      className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'} hover:text-gray-900`} 
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleComment}
                    className="p-0 h-auto hover:bg-transparent"
                  >
                    <MessageCircle size={24} className="text-gray-700 hover:text-gray-900" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 h-auto hover:bg-transparent"
                  >
                    <Send size={24} className="text-gray-700 hover:text-gray-900" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 h-auto hover:bg-transparent ml-auto"
                  >
                    <Bookmark size={24} className="text-gray-700 hover:text-gray-900" />
                  </Button>
                </div>

                <p className="font-medium text-sm mb-2">
                  {likesCount.toLocaleString()} likes
                </p>

                {/* Caption */}
                <div className="mb-2">
                  <span 
                    className="font-medium text-sm mr-2 cursor-pointer hover:underline"
                    onClick={() => onProfileClick(post.user_id)}
                  >
                    {post.profiles?.username}
                  </span>
                  <span className="text-sm">{post.caption}</span>
                </div>

                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>

              {/* Comments Section - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-center text-gray-500 py-8">
                  <p>No comments yet</p>
                  <p className="text-sm">Be the first to comment!</p>
                </div>
              </div>

              {/* Add Comment */}
              {user && (
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 border-none focus:ring-0 p-0"
                    />
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      variant="ghost"
                      size="sm"
                      className="text-blue-500 hover:text-blue-600 disabled:text-gray-400"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={post.id}
        onProfileClick={onProfileClick}
      />

      <EditPostModal
        post={editPostData}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={handlePostUpdate}
      />
    </>
  );
};

export default FullPostModal;
