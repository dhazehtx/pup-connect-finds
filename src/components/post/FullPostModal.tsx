
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, MoreHorizontal, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useComments } from '@/hooks/useComments';
import { useRealtimePostLikes } from '@/hooks/useRealtimePostLikes';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface Post {
  id: string;
  user_id: string;
  caption: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface FullPostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onProfileClick?: (userId: string) => void;
  onPostUpdate?: (postId: string, newCaption: string) => void;
  onPostDelete?: (postId: string) => void;
  initialComments?: Comment[];
}

const FullPostModal = ({ 
  post, 
  isOpen, 
  onClose, 
  onProfileClick,
  onPostUpdate,
  onPostDelete,
  initialComments = []
}: FullPostModalProps) => {
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const { toast } = useToast();
  
  const { comments, addComment } = useComments(post?.id || '');
  const { likesCount, isLiked, toggleLike } = useRealtimePostLikes(post?.id || '');

  // Use initial comments if provided, otherwise use fetched comments
  const displayComments = initialComments.length > 0 ? initialComments : comments;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(newComment);
      setNewComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  if (!post) return null;

  const visibleComments = showAllComments ? displayComments : displayComments.slice(-2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden h-[90vh] md:h-[90vh]">
        <VisuallyHidden>
          <DialogTitle>Post by {post.profiles?.username || 'Unknown User'}</DialogTitle>
        </VisuallyHidden>
        
        {/* Mobile Layout */}
        <div className="flex flex-col h-full md:hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Avatar 
                className="h-8 w-8 cursor-pointer"
                onClick={() => onProfileClick?.(post.user_id)}
              >
                <AvatarImage src={post.profiles?.avatar_url || ''} />
                <AvatarFallback>
                  {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p 
                  className="font-semibold text-sm cursor-pointer hover:text-gray-600"
                  onClick={() => onProfileClick?.(post.user_id)}
                >
                  {post.profiles?.username || 'Unknown User'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Image */}
          <div className="bg-black flex items-center justify-center flex-shrink-0 aspect-square">
            {post.image_url && (
              <img
                src={post.image_url}
                alt="Post"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Mobile Content - Scrollable */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Action Buttons */}
            <div className="flex items-center justify-between p-4 pb-2 flex-shrink-0">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLike}
                  className={isLiked ? 'text-red-500' : ''}
                >
                  <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon">
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Likes Count */}
            {likesCount > 0 && (
              <div className="px-4 pb-2 flex-shrink-0">
                <p className="text-sm font-semibold">
                  {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </p>
              </div>
            )}

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-2 min-h-0">
              <div className="space-y-4">
                {/* Post Caption */}
                {post.caption && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={post.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold mr-2">
                          {post.profiles?.username || 'Unknown User'}
                        </span>
                        {post.caption}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                {displayComments.length > 0 && (
                  <div className="space-y-4">
                    {!showAllComments && displayComments.length > 2 && (
                      <button
                        onClick={() => setShowAllComments(true)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        View all {displayComments.length} comments
                      </button>
                    )}
                    
                    {visibleComments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={comment.profiles?.avatar_url || ''} />
                          <AvatarFallback>
                            {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-semibold mr-2">
                              {comment.profiles?.username || 'Unknown User'}
                            </span>
                            {comment.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Comment Input - Sticky Bottom */}
            <div className="border-t bg-white flex-shrink-0">
              <form onSubmit={handleAddComment} className="p-4">
                <div className="flex items-center space-x-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 min-h-[40px] resize-none border-0 shadow-none focus-visible:ring-0 p-0"
                    rows={1}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    disabled={!newComment.trim()}
                    className="text-blue-500 hover:text-blue-600 disabled:text-gray-400"
                  >
                    Post
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-row h-full">
          {/* Image Section */}
          <div className="bg-black flex items-center justify-center relative md:w-3/5">
            {post.image_url && (
              <img
                src={post.image_url}
                alt="Post"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Content Section */}
          <div className="flex flex-col h-full md:w-2/5 min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center space-x-3">
                <Avatar 
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => onProfileClick?.(post.user_id)}
                >
                  <AvatarImage src={post.profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p 
                    className="font-semibold text-sm cursor-pointer hover:text-gray-600"
                    onClick={() => onProfileClick?.(post.user_id)}
                  >
                    {post.profiles?.username || 'Unknown User'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4 space-y-4">
                {/* Post Caption */}
                {post.caption && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={post.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold mr-2">
                          {post.profiles?.username || 'Unknown User'}
                        </span>
                        {post.caption}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                {displayComments.length > 0 && (
                  <div className="space-y-4">
                    {!showAllComments && displayComments.length > 2 && (
                      <button
                        onClick={() => setShowAllComments(true)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        View all {displayComments.length} comments
                      </button>
                    )}
                    
                    {visibleComments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={comment.profiles?.avatar_url || ''} />
                          <AvatarFallback>
                            {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-semibold mr-2">
                              {comment.profiles?.username || 'Unknown User'}
                            </span>
                            {comment.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Bottom Actions and Input */}
            <div className="border-t bg-white flex-shrink-0">
              {/* Action Buttons */}
              <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLike}
                    className={isLiked ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              {/* Likes Count */}
              {likesCount > 0 && (
                <div className="px-4 pb-2">
                  <p className="text-sm font-semibold">
                    {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                  </p>
                </div>
              )}

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="p-4 pt-0">
                <div className="flex items-center space-x-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 min-h-[40px] resize-none border-0 shadow-none focus-visible:ring-0 p-0"
                    rows={1}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    disabled={!newComment.trim()}
                    className="text-blue-500 hover:text-blue-600 disabled:text-gray-400"
                  >
                    Post
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullPostModal;
