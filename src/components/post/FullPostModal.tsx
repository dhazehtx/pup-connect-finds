import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, X, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePostLikes } from '@/hooks/usePostLikes';
import { useComments } from '@/hooks/useComments';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FullPostModalProps {
  post: {
    id: string;
    user_id: string;
    caption: string | null;
    image_url: string | null;
    imageUrl?: string | null;
    video_url: string | null;
    created_at: string;
    profiles: {
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');

  // Only use hooks when post exists
  const { likesCount, isLiked, toggleLike } = usePostLikes(post?.id || '');
  const { comments, loading: commentsLoading, addComment, fetchComments } = useComments(post?.id || '');

  useEffect(() => {
    if (post && isOpen) {
      setEditedCaption(post.caption || '');
    }
  }, [post, isOpen]);

  if (!post) {
    return null;
  }

  // Get the correct image URL
  const imageUrl = post.imageUrl || post.image_url;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(newComment);
      setNewComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to like posts",
        variant: "destructive",
      });
      return;
    }
    await toggleLike();
  };

  const handleProfileClick = () => {
    if (onProfileClick && post.user_id) {
      onProfileClick(post.user_id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!post || !user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({ caption: editedCaption })
        .eq('id', post.id);

      if (error) throw error;

      if (onPostUpdate) {
        onPostUpdate(post.id, editedCaption);
      }

      setIsEditing(false);
      toast({
        title: "Post updated",
        description: "Your post has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!post || !user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      if (onPostDelete) {
        onPostDelete(post.id);
      }

      onClose();
      toast({
        title: "Post deleted",
        description: "Your post has been removed.",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCaption(post.caption || '');
  };

  const isOwner = user?.id === post.user_id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left side - Image/Video */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Post content"
                className="max-w-full max-h-full object-contain w-full h-full"
              />
            )}
            
            {post.video_url && (
              <video
                src={post.video_url}
                controls
                className="max-w-full max-h-full object-contain w-full h-full"
              />
            )}
          </div>

          {/* Right side - Comments and interactions */}
          <div className="w-96 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {post.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <button
                      onClick={handleProfileClick}
                      className="text-sm font-semibold hover:text-gray-500"
                    >
                      {post.profiles?.username || 'Unknown User'}
                    </button>
                  </div>
                </div>
                
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleEdit}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Caption */}
            <div className="p-4 border-b">
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    className="min-h-[100px] resize-none"
                    placeholder="Write a caption..."
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {post.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="text-sm font-semibold">
                      {post.profiles?.username || 'Unknown User'}
                    </span>
                    <span className="text-sm ml-2">{post.caption}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto">
              {commentsLoading ? (
                <div className="p-4 text-center text-gray-500">Loading comments...</div>
              ) : (
                <div className="space-y-1">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {comment.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onProfileClick && onProfileClick(comment.user_id)}
                              className="text-sm font-semibold hover:text-gray-500"
                            >
                              {comment.profiles?.username || 'Unknown User'}
                            </button>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLike}
                    className="hover:bg-red-50"
                  >
                    <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon">
                  <Bookmark className="h-6 w-6" />
                </Button>
              </div>

              {likesCount > 0 && (
                <div className="text-sm font-semibold mb-2">
                  {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </div>
              )}

              {/* Comment input */}
              <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullPostModal;
