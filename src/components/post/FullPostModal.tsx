
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, X, Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useComments } from '@/hooks/useComments';

interface FullPostModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  onProfileClick?: (userId: string) => void;
  onPostUpdate?: (postId: string, newCaption: string) => void;
  onPostDelete?: (postId: string) => void;
  initialComments?: any[];
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
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const { comments, loading, addComment } = useComments(post?.id || '');
  const displayComments = comments.length > 0 ? comments : initialComments;

  useEffect(() => {
    if (post?.caption) {
      setEditedCaption(post.caption);
    }
  }, [post?.caption]);

  if (!post) return null;

  const handleComment = async () => {
    if (newComment.trim()) {
      await addComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleEdit = () => {
    if (onPostUpdate) {
      onPostUpdate(post.id, editedCaption);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onPostDelete) {
      onPostDelete(post.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 gap-0 bg-white">
        {/* Mobile Layout */}
        <div className="flex flex-col h-full md:hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar 
                className="w-8 h-8 cursor-pointer"
                onClick={() => onProfileClick?.(post.user_id)}
              >
                <AvatarImage src={post.profiles?.avatar_url || ''} />
                <AvatarFallback>
                  {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span 
                className="font-semibold text-sm cursor-pointer"
                onClick={() => onProfileClick?.(post.user_id)}
              >
                {post.profiles?.username || 'User'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Image */}
          <div className="w-full aspect-square bg-gray-100 flex-shrink-0">
            <img
              src={post.image_url || 'https://placedog.com/400/400'}
              alt="Post"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="p-0 h-auto"
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <MessageCircle className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <Share2 className="w-6 h-6" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-0 h-auto"
            >
              <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Caption */}
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={post.profiles?.avatar_url || ''} />
                <AvatarFallback>
                  {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm mr-2">
                  {post.profiles?.username || 'User'}
                </span>
                <span className="text-sm">{post.caption}</span>
              </div>
            </div>
          </div>

          {/* Comments Section - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-4 p-4">
              {displayComments.length > 0 ? (
                displayComments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={comment.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {comment.profiles?.username || 'User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No comments yet</p>
                  <p className="text-gray-400 text-xs mt-1">Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>

          {/* Comment Input - Sticky Bottom */}
          <div className="border-t p-4 bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
              <Button
                onClick={handleComment}
                disabled={!newComment.trim()}
                size="sm"
                className="px-4"
              >
                Post
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex h-full">
          {/* Image Section */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <img
              src={post.image_url || 'https://placedog.com/400/400'}
              alt="Post"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Content Section */}
          <div className="w-80 flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar 
                  className="w-8 h-8 cursor-pointer"
                  onClick={() => onProfileClick?.(post.user_id)}
                >
                  <AvatarImage src={post.profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span 
                  className="font-semibold text-sm cursor-pointer"
                  onClick={() => onProfileClick?.(post.user_id)}
                >
                  {post.profiles?.username || 'User'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(onPostUpdate || onPostDelete) && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    {showMenu && (
                      <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10">
                        {onPostUpdate && (
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowMenu(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                        )}
                        {onPostDelete && (
                          <button
                            onClick={() => {
                              handleDelete();
                              setShowMenu(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Caption and Comments */}
            <div className="flex-1 overflow-y-auto">
              {/* Caption */}
              <div className="p-4 border-b">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={post.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm mr-2">
                      {post.profiles?.username || 'User'}
                    </span>
                    {isEditing ? (
                      <div className="mt-2">
                        <Input
                          value={editedCaption}
                          onChange={(e) => setEditedCaption(e.target.value)}
                          className="mb-2"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleEdit}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm">{post.caption}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-4 p-4">
                {displayComments.length > 0 ? (
                  displayComments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={comment.profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {comment.profiles?.username || 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No comments yet</p>
                    <p className="text-gray-400 text-xs mt-1">Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions and Comment Input */}
            <div className="border-t">
              {/* Action Icons */}
              <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className="p-0 h-auto"
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <Share2 className="w-6 h-6" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="p-0 h-auto"
                >
                  <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Comment Input */}
              <div className="p-4 pt-2">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                    size="sm"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullPostModal;
