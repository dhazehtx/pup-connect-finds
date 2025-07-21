
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
import { useComments } from '@/hooks/useComments';

interface FullPostModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: (userId: string) => void;
  onPostUpdate?: (postId: string, newCaption: string) => void;
  onPostDelete?: (postId: string) => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  replies?: Comment[];
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
  const { comments, loading, addComment } = useComments(post?.id);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  if (!post) return null;

  const isOwner = user?.id === post.user_id;
  const displayComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

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

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    
    setSubmittingComment(true);
    try {
      await addComment(newComment.trim());
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddComment();
    }
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyingTo(commentId);
    setNewComment(`@${username} `);
  };

  const handleUsernameClick = (username: string, userId: string) => {
    onProfileClick(userId);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-2' : ''}`}>
      <div className="flex gap-3">
        <Avatar 
          className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => handleUsernameClick(comment.profiles?.username || '', comment.user_id)}
        >
          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {comment.profiles?.full_name?.charAt(0) || 
             comment.profiles?.username?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="font-medium text-sm cursor-pointer hover:underline"
              onClick={() => handleUsernameClick(comment.profiles?.username || '', comment.user_id)}
            >
              {comment.profiles?.username || comment.profiles?.full_name || 'User'}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm break-words">{comment.content}</p>
          {user && (
            <button
              onClick={() => handleReply(comment.id, comment.profiles?.username || 'User')}
              className="text-xs text-gray-500 hover:text-gray-700 mt-1"
            >
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );

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
            {/* Image Section */}
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
                      ? 'max-h-[40vh] min-h-[200px]' 
                      : 'max-h-[80vh]'
                    }
                  `}
                />
              </div>
            </div>

            {/* Content Section - Fixed mobile layout with sticky comment input */}
            <div className={`${isMobile ? 'flex-1 min-h-0' : 'w-96'} bg-white flex flex-col relative`}>
              {/* Header - Fixed at top */}
              <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
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

              {/* Scrollable Content Area - Takes remaining space minus comment input */}
              <div className={`flex-1 overflow-y-auto ${user ? 'pb-16' : 'pb-4'}`}>
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

                {/* Comments Section */}
                <div className="p-4">
                  {loading ? (
                    <div className="text-center text-gray-500 py-4">
                      <p className="text-sm">Loading comments...</p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No comments yet</p>
                      <p className="text-sm">Be the first to comment!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {displayComments.map((comment) => renderComment(comment))}
                      
                      {hasMoreComments && !showAllComments && (
                        <button
                          onClick={() => setShowAllComments(true)}
                          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                        >
                          View all {comments.length} comments
                        </button>
                      )}
                      
                      {showAllComments && hasMoreComments && (
                        <button
                          onClick={() => setShowAllComments(false)}
                          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Show less
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Comment Input at Bottom - Always visible */}
              {user && (
                <div className={`
                  absolute bottom-0 left-0 right-0 bg-white border-t
                  ${isMobile ? 'p-3' : 'p-4'}
                  z-10
                `}>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={submittingComment}
                      className="flex-1 border-none focus:ring-0 p-0"
                    />
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submittingComment}
                      variant="ghost"
                      size="sm"
                      className="text-blue-500 hover:text-blue-600 disabled:text-gray-400"
                    >
                      {submittingComment ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                  {replyingTo && (
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setNewComment('');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                    >
                      Cancel reply
                    </button>
                  )}
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
