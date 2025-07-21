
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, X, MoreHorizontal, Edit3, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useComments } from '@/hooks/useComments';
import { usePostLikes } from '@/hooks/usePostLikes';
import AnimatedHeart from '@/components/ui/animated-heart';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EditPostModal from '@/components/home/EditPostModal';

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
  const [newComment, setNewComment] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  
  const { comments, addComment, loading: commentsLoading } = useComments(post?.id || '');
  const { likesCount, isLiked, toggleLike, loading: likesLoading } = usePostLikes(post?.id || '');

  if (!post) return null;

  const isOwner = user?.id === post.user_id;

  const handleEdit = () => {
    // Convert post to the format expected by EditPostModal
    const editPost = {
      id: 1, // dummy id for compatibility
      postUuid: post.id,
      user: {
        id: post.user_id,
        username: post.profiles?.username || 'User',
        name: post.profiles?.full_name || 'User',
        location: 'Location',
        avatar: post.profiles?.avatar_url || '',
      },
      image: post.image_url || '',
      likes: likesCount,
      isLiked: isLiked,
      caption: post.caption || '',
      timeAgo: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
    };
    
    setEditingPost(editPost);
    setShowEditModal(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!post) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });

      onPostDelete?.(post.id);
      onClose();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handlePostUpdate = (postId: string, newCaption: string) => {
    onPostUpdate?.(postId, newCaption);
    setShowEditModal(false);
    setEditingPost(null);
  };

  const handleAddComment = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleProfileClick = (userId: string) => {
    if (onProfileClick) {
      onProfileClick(userId);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] h-[95vh] p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row h-full">
            {/* Media Section */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-0">
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt="Post content"
                  className="max-w-full max-h-full object-contain"
                />
              ) : post.video_url ? (
                <video
                  src={post.video_url}
                  className="max-w-full max-h-full object-contain"
                  controls
                />
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 text-gray-500">
                  No media content
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="w-full md:w-96 flex flex-col h-full md:h-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar 
                    className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleProfileClick(post.user_id)}
                  >
                    <AvatarImage src={post.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {post.profiles?.full_name?.charAt(0) || 
                       post.profiles?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p 
                      className="font-semibold text-sm cursor-pointer hover:underline"
                      onClick={() => handleProfileClick(post.user_id)}
                    >
                      {post.profiles?.username || post.profiles?.full_name || 'User'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Post
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={handleDeleteClick}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X size={16} />
                  </Button>
                </div>
              </div>

              {/* Caption */}
              {post.caption && (
                <div className="p-4 border-b flex-shrink-0">
                  <div className="flex gap-3">
                    <Avatar 
                      className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleProfileClick(post.user_id)}
                    >
                      <AvatarImage src={post.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {post.profiles?.full_name?.charAt(0) || 
                         post.profiles?.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span 
                        className="font-semibold text-sm mr-2 cursor-pointer hover:underline"
                        onClick={() => handleProfileClick(post.user_id)}
                      >
                        {post.profiles?.username || post.profiles?.full_name || 'User'}
                      </span>
                      <span className="text-sm">{post.caption}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {commentsLoading ? (
                  <div className="text-center text-gray-500">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-gray-500">No comments yet</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar 
                        className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleProfileClick(comment.user_id)}
                      >
                        <AvatarImage src={comment.profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          {comment.profiles?.full_name?.charAt(0) || 
                           comment.profiles?.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span 
                            className="font-semibold mr-2 cursor-pointer hover:underline"
                            onClick={() => handleProfileClick(comment.user_id)}
                          >
                            {comment.profiles?.username || comment.profiles?.full_name || 'User'}
                          </span>
                          <span>{comment.content}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t flex-shrink-0">
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
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => document.getElementById('comment-input')?.focus()}
                    >
                      <MessageCircle size={24} className="text-gray-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={handleShare}
                    >
                      <Share size={24} className="text-gray-600" />
                    </Button>
                  </div>
                </div>

                <p className="font-semibold text-sm mb-3">
                  {likesCount.toLocaleString()} likes
                </p>

                <div className="flex items-center gap-2">
                  <input
                    id="comment-input"
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 text-sm bg-transparent border-none outline-none"
                  />
                  {newComment.trim() && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 font-semibold p-0 h-auto"
                      onClick={handleAddComment}
                    >
                      Post
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <EditPostModal
        post={editingPost}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPost(null);
        }}
        onUpdate={handlePostUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FullPostModal;
