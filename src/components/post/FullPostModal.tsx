
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Heart, MessageCircle, Share, Send, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useComments } from '@/hooks/useComments';
import { usePostLikes } from '@/hooks/usePostLikes';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import AnimatedHeart from '@/components/ui/animated-heart';
import CommentItem from './CommentItem';

interface FullPostModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  onShare?: (post: any) => void;
}

const FullPostModal = ({ post, isOpen, onClose, onShare }: FullPostModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { comments, loading: commentsLoading, addComment } = useComments(post.id);
  const { likesCount, isLiked, loading: likesLoading, toggleLike } = usePostLikes(post.id);
  
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addComment(newComment.trim());
      setNewComment('');
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    await toggleLike();
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    // You can implement reply functionality here
    console.log('Replying to comment:', commentId);
  };

  const handleUsernameClick = (username: string) => {
    // Navigate to user profile
    navigate(`/profile/${username}`);
    onClose();
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.user?.avatar} />
                <AvatarFallback>
                  {post.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => handleProfileClick(post.user?.id)}
                className="font-medium hover:underline"
              >
                {post.user?.name}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <MoreHorizontal size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Post Image */}
            <div className="relative bg-black flex items-center justify-center">
              <img
                src={post.image}
                alt="Post"
                className="max-w-full max-h-[50vh] object-contain"
              />
            </div>

            {/* Post Actions */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <AnimatedHeart
                    isLiked={isLiked}
                    onToggle={handleLike}
                    size={24}
                    disabled={likesLoading}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 h-auto hover:bg-transparent"
                  >
                    <MessageCircle size={24} className="text-gray-700" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onShare?.(post)}
                    className="p-0 h-auto hover:bg-transparent"
                  >
                    <Share size={24} className="text-gray-700" />
                  </Button>
                </div>
              </div>

              {/* Likes count */}
              <div className="mb-3">
                <span className="font-medium text-sm">
                  {likesCount.toLocaleString()} likes
                </span>
              </div>

              {/* Caption */}
              {post.caption && (
                <div className="mb-3">
                  <span className="font-medium text-sm mr-2">
                    {post.user?.username}
                  </span>
                  <span className="text-sm">{post.caption}</span>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="px-4 pb-4">
              {commentsLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No comments yet</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to comment!</p>
                </div>
              ) : (
                <>
                  {displayedComments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onReply={handleReply}
                      onProfileClick={handleUsernameClick}
                      showReplies={true}
                    />
                  ))}

                  {hasMoreComments && !showAllComments && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllComments(true)}
                      className="text-gray-600 p-0 h-auto hover:bg-transparent mt-2"
                    >
                      View all {comments.length} comments
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Fixed Comment Input */}
          <div className="border-t bg-white p-4">
            <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border-none focus:ring-0 focus-visible:ring-0"
                disabled={!user}
              />
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting || !user}
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:text-blue-600 disabled:text-gray-400"
              >
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullPostModal;
