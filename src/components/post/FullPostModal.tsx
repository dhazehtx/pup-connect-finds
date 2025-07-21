

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Send, MoreHorizontal, X } from 'lucide-react';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import { useComments } from '@/hooks/useComments';
import { useRealtimePostLikes } from '@/hooks/useRealtimePostLikes';

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
  const { isMobile } = useMobileOptimized();
  const [newComment, setNewComment] = useState('');
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  
  // Always call hooks - use empty string as fallback for postId to avoid conditional hook calls
  const postId = post?.id || '';
  const { comments: realComments, addComment, loading } = useComments(postId);
  const { likesCount, isLiked, toggleLike } = useRealtimePostLikes(postId);
  
  // Use real comments if available and post exists, otherwise fall back to initial comments
  const comments = post && realComments.length > 0 ? realComments : initialComments;
  
  useEffect(() => {
    if (!isOpen) {
      setNewComment('');
      setShowFullCaption(false);
      setShowAllComments(false);
    }
  }, [isOpen]);

  // Early return after all hooks have been called
  if (!post) return null;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;
    
    await addComment(newComment.trim());
    setNewComment('');
  };

  const handleProfileClick = () => {
    if (onProfileClick && post.user_id) {
      onProfileClick(post.user_id);
    }
  };

  // Get comments to display based on mobile/desktop and showAllComments state
  const getDisplayedComments = () => {
    if (isMobile && !showAllComments) {
      return comments.slice(-2); // Show last 2 comments on mobile
    }
    return comments;
  };

  const displayedComments = getDisplayedComments();
  const hasMoreComments = isMobile && !showAllComments && comments.length > 2;

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-0 m-0 max-w-full w-full h-full max-h-full border-0 rounded-none bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 cursor-pointer" onClick={handleProfileClick}>
                <AvatarImage src={post.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span 
                className="font-semibold text-sm cursor-pointer" 
                onClick={handleProfileClick}
              >
                {post.profiles?.username || 'Unknown User'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src={post.image_url || ''}
                alt="Post"
                className="w-full h-auto max-h-[50vh] object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="flex-shrink-0 px-4 py-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLike}
                    className="p-0 h-auto"
                  >
                    <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <Send className="h-6 w-6" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
              
              {likesCount > 0 && (
                <p className="text-sm font-semibold mb-2">{likesCount} likes</p>
              )}
            </div>

            {/* Caption */}
            {post.caption && (
              <div className="flex-shrink-0 px-4 py-3 border-b">
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-sm">{post.profiles?.username}</span>
                  <div className="flex-1">
                    {post.caption.length > 100 && !showFullCaption ? (
                      <div>
                        <span className="text-sm">{post.caption.slice(0, 100)}...</span>
                        <button 
                          onClick={() => setShowFullCaption(true)}
                          className="text-gray-500 text-sm ml-1"
                        >
                          more
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm">{post.caption}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {loading ? (
                <div className="text-center text-gray-500 py-4">Loading comments...</div>
              ) : (
                <>
                  {hasMoreComments && (
                    <button
                      onClick={() => setShowAllComments(true)}
                      className="text-gray-500 text-sm mb-4 hover:text-gray-700"
                    >
                      View all {comments.length} comments
                    </button>
                  )}
                  
                  {displayedComments.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">No comments yet</div>
                  ) : (
                    <div className="space-y-4">
                      {displayedComments.map((comment) => (
                        <div key={comment.id} className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                            <AvatarFallback>
                              {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm">
                                {comment.profiles?.username || 'Unknown User'}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 break-words">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Comment Input - Sticky Bottom */}
          <div className="flex-shrink-0 p-4 border-t bg-white">
            <form onSubmit={handleSubmitComment} className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs">U</AvatarFallback>
              </Avatar>
              <Input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border-none bg-gray-50 rounded-full px-4 focus:ring-0 focus:border-none"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="sm" 
                disabled={!newComment.trim()}
                className="text-blue-500 font-semibold disabled:text-gray-400"
              >
                Post
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop layout remains unchanged
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 overflow-hidden bg-white">
        <div className="flex h-full">
          {/* Left side - Image */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <img
              src={post.image_url || ''}
              alt="Post"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Right side - Content */}
          <div className="w-96 flex flex-col border-l">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8 cursor-pointer" onClick={handleProfileClick}>
                  <AvatarImage src={post.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span 
                  className="font-semibold cursor-pointer" 
                  onClick={handleProfileClick}
                >
                  {post.profiles?.username || 'Unknown User'}
                </span>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>

            {/* Comments section */}
            <div className="flex-1 overflow-y-auto">
              {/* Post caption as first "comment" */}
              {post.caption && (
                <div className="p-4 border-b">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold">{post.profiles?.username}</span>
                        <span className="text-gray-500 text-sm">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{post.caption}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="space-y-4 p-4">
                {loading ? (
                  <div className="text-center text-gray-500">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-gray-500">No comments yet</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm">
                            {comment.profiles?.username || 'Unknown User'}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions and comment input */}
            <div className="border-t">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLike}
                    className="p-0 h-auto"
                  >
                    <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <Send className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              {likesCount > 0 && (
                <div className="px-4 pb-2">
                  <p className="text-sm font-semibold">{likesCount} likes</p>
                </div>
              )}

              <form onSubmit={handleSubmitComment} className="p-4 border-t">
                <div className="flex items-center space-x-3">
                  <Input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    variant="ghost" 
                    size="sm" 
                    disabled={!newComment.trim()}
                    className="text-blue-500 font-semibold"
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
