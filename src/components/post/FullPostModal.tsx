
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, X } from 'lucide-react';
import { usePostLikes } from '@/hooks/usePostLikes';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface FullPostModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  onProfileClick?: (userId: string) => void;
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
  const [commentText, setCommentText] = useState('');
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const { user } = useAuth();
  
  // Always call hooks with fallback values - never conditionally
  const postId = post?.id || '';
  const { likesCount, isLiked, toggleLike } = usePostLikes(postId);
  const { comments, addComment, loading: commentsLoading } = useComments(postId);

  // Early return AFTER all hooks are called
  if (!post) return null;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      await addComment(commentText);
      setCommentText('');
    }
  };

  const handleProfileClick = (userId: string) => {
    if (onProfileClick) {
      onProfileClick(userId);
    }
  };

  const imageUrl = post.image_url || post.imageUrl;
  
  // For mobile: show only 1-2 recent comments, for desktop: show 3
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const visibleCommentsCount = isMobile ? 2 : 3;
  const displayedComments = comments.slice(-visibleCommentsCount); // Get most recent
  const remainingCommentsCount = Math.max(0, comments.length - visibleCommentsCount);

  // Caption truncation for mobile
  const maxCaptionLength = 100;
  const shouldTruncateCaption = post.caption && post.caption.length > maxCaptionLength && !isCaptionExpanded;
  const displayCaption = shouldTruncateCaption 
    ? post.caption.substring(0, maxCaptionLength) + '...' 
    : post.caption;

  const CommentSkeleton = () => (
    <div className="flex gap-3 mb-4 animate-pulse">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[95vh] md:h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* Image Section */}
          <div className="flex-1 bg-black flex items-center justify-center relative min-h-[40vh] md:min-h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-black/20 md:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Post"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="text-white/60 text-center">
                <div className="text-lg">No image available</div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="w-full md:w-96 bg-background flex flex-col h-full md:h-auto">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hidden md:block"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Avatar 
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => handleProfileClick(post.user_id)}
                >
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback>
                    {post.profiles?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <button 
                    onClick={() => handleProfileClick(post.user_id)}
                    className="font-semibold text-sm hover:underline"
                  >
                    {post.profiles?.username || 'Unknown User'}
                  </button>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex-shrink-0 p-4 border-b border-border">
              <div className="flex items-center gap-4 mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLike}
                  className="h-8 w-8"
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Send className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>

              {likesCount > 0 && (
                <div className="text-sm font-semibold mb-2">
                  {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </div>
              )}
            </div>

            {/* Caption - Collapsible on mobile */}
            {post.caption && (
              <div className="flex-shrink-0 px-4 py-3 border-b border-border">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>
                      {post.profiles?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-semibold mr-2">
                        {post.profiles?.username || 'Unknown User'}
                      </span>
                      <span className="break-words">{displayCaption}</span>
                      {shouldTruncateCaption && (
                        <button 
                          onClick={() => setIsCaptionExpanded(true)}
                          className="text-muted-foreground hover:text-foreground ml-1"
                        >
                          more
                        </button>
                      )}
                      {isCaptionExpanded && post.caption.length > maxCaptionLength && (
                        <button 
                          onClick={() => setIsCaptionExpanded(false)}
                          className="text-muted-foreground hover:text-foreground ml-1"
                        >
                          less
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section - Optimized for mobile visibility */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Comments Header */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-border">
                <h3 className="text-sm font-bold text-foreground">Comments</h3>
              </div>

              {/* Scrollable Comments Content */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {commentsLoading ? (
                  // Loading Skeletons
                  <div className="space-y-4">
                    {Array.from({ length: visibleCommentsCount }).map((_, i) => (
                      <CommentSkeleton key={i} />
                    ))}
                  </div>
                ) : comments.length > 0 ? (
                  // Actual Comments
                  <div className="space-y-4">
                    {remainingCommentsCount > 0 && (
                      <button className="text-sm text-muted-foreground hover:underline font-medium mb-4">
                        View all {comments.length} comments
                      </button>
                    )}
                    
                    {displayedComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={comment.profiles?.avatar_url} />
                          <AvatarFallback>
                            {comment.profiles?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            <button 
                              className="font-semibold mr-2 hover:underline"
                              onClick={() => handleProfileClick(comment.user_id)}
                            >
                              {comment.profiles?.username || 'Unknown User'}
                            </button>
                            <span className="break-words">{comment.content}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // No Comments State
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm font-medium">No comments yet</div>
                    <div className="text-xs mt-1">Be the first to comment!</div>
                  </div>
                )}
              </div>
            </div>

            {/* Comment Input - Fixed at bottom */}
            <div className="flex-shrink-0 border-t border-border bg-background sticky bottom-0">
              {commentsLoading ? (
                // Loading skeleton for comment input
                <div className="p-4">
                  <div className="flex items-center gap-3 animate-pulse">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <Skeleton className="flex-1 h-10 rounded-md" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitComment} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user?.user_metadata?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 border-none shadow-none focus-visible:ring-0 px-0 bg-transparent text-sm"
                      />
                      <Button 
                        type="submit" 
                        variant="ghost" 
                        size="sm"
                        disabled={!commentText.trim()}
                        className="text-primary hover:text-primary/80 disabled:text-muted-foreground px-3 font-semibold"
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullPostModal;
