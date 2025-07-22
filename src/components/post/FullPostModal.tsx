
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, MoreHorizontal, X } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { formatDistanceToNow } from 'date-fns';

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
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  const { comments: fetchedComments, addComment, fetchComments } = useComments(post?.id || '');
  
  // Always use fetched comments to ensure real-time updates
  const comments = fetchedComments.length > 0 ? fetchedComments : initialComments;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    await addComment(newComment.trim());
    setNewComment('');
    // Force refresh comments after adding
    setTimeout(() => fetchComments(), 100);
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden md:flex h-full">
          {/* Image Section */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <img
              src={post.image_url || 'https://placedog.com/600/600'}
              alt="Post"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Comments Section */}
          <div className="w-80 flex flex-col border-l bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span 
                  className="font-semibold cursor-pointer hover:opacity-75"
                  onClick={() => onProfileClick?.(post.user_id)}
                >
                  {post.profiles?.username || 'Unknown User'}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Caption */}
            {post.caption && (
              <div className="p-4 border-b">
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={post.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="font-semibold mr-2">
                      {post.profiles?.username || 'Unknown User'}
                    </span>
                    <span className="text-sm">{post.caption}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">
                        {comment.profiles?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className="p-0 hover:bg-transparent"
                  >
                    <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                    <Share className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {likeCount > 0 && (
                <p className="text-sm font-semibold mb-3">{likeCount} likes</p>
              )}

              <form onSubmit={handleSubmitComment} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="sm"
                  disabled={!newComment.trim()}
                  className="text-blue-500 font-semibold hover:bg-transparent disabled:opacity-50"
                >
                  Post
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.profiles?.avatar_url || ''} />
                <AvatarFallback>
                  {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span 
                className="font-semibold cursor-pointer hover:opacity-75"
                onClick={() => onProfileClick?.(post.user_id)}
              >
                {post.profiles?.username || 'Unknown User'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Image */}
          <div className="bg-black flex items-center justify-center aspect-square flex-shrink-0">
            <img
              src={post.image_url || 'https://placedog.com/600/600'}
              alt="Post"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Action Bar & Content */}
          <div className="flex-1 flex flex-col bg-white min-h-0">
            {/* Action Bar */}
            <div className="p-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className="p-0 hover:bg-transparent"
                  >
                    <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                    <Share className="w-6 h-6" />
                  </Button>
                </div>
              </div>
              {likeCount > 0 && (
                <p className="text-sm font-semibold">{likeCount} likes</p>
              )}
            </div>

            {/* Caption & Comments - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* Caption */}
              {post.caption && (
                <div className="p-4 border-b">
                  <div className="flex space-x-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={post.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span className="font-semibold mr-2">
                        {post.profiles?.username || 'Unknown User'}
                      </span>
                      <span className="text-sm">{post.caption}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="p-4 space-y-4">
                {/* Show if no comments */}
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No comments yet</p>
                    <p className="text-gray-400 text-xs">Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={comment.profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm">
                            {comment.profiles?.username || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sticky Comment Input */}
            <div className="p-4 border-t bg-white flex-shrink-0">
              <form onSubmit={handleSubmitComment} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 border-gray-200"
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="sm"
                  disabled={!newComment.trim()}
                  className="text-blue-500 font-semibold hover:bg-transparent disabled:opacity-50"
                >
                  Post
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
