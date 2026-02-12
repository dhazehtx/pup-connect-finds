
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, MoreHorizontal, X, Reply, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';

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
  parent_comment_id?: string | null;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  replies?: Comment[];
  reply_count?: number;
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  
  const location = useLocation();
  const { comments: fetchedComments, addComment, fetchComments } = useComments(post?.id || '');
  
  // Always use fetched comments to ensure real-time updates
  const comments = fetchedComments.length > 0 ? fetchedComments : initialComments;

  // Handle deep linking to specific comments
  useEffect(() => {
    if (isOpen && location) {
      const url = new URL(window.location.href);
      const commentId = url.searchParams.get('comment');
      if (commentId) {
        setHighlightedCommentId(commentId);
        // Auto-expand the highlighted comment's thread
        setExpandedComments(prev => new Set(Array.from(prev).concat(commentId)));
        
        // Scroll to the comment after a short delay to ensure rendering
        setTimeout(() => {
          const commentElement = document.getElementById(`comment-${commentId}`);
          if (commentElement) {
            commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedCommentId(null);
        }, 3000);
      }
    }
  }, [isOpen, location]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    await addComment(newComment.trim());
    setNewComment('');
    // Force refresh comments after adding
    setTimeout(() => fetchComments(), 100);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !post || !replyingTo) return;

    await addComment(replyContent.trim(), replyingTo);
    setReplyContent('');
    setReplyingTo(null);
    // Force refresh comments after adding
    setTimeout(() => fetchComments(), 100);
  };

  const toggleExpanded = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  // Organize comments into threaded structure
  const organizeComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // Create map and initialize replies arrays
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Organize into threads
    comments.forEach(comment => {
      const mappedComment = commentMap.get(comment.id)!;
      
      if (comment.parent_comment_id) {
        // This is a reply, add to parent's replies
        const parentComment = commentMap.get(comment.parent_comment_id);
        if (parentComment) {
          parentComment.replies!.push(mappedComment);
        }
      } else {
        // This is a root comment
        rootComments.push(mappedComment);
      }
    });

    // Sort replies by creation date
    commentMap.forEach(comment => {
      if (comment.replies) {
        comment.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
    });

    return rootComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const organizedComments = organizeComments(comments);

  const handleLike = () => {
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Post Details</DialogTitle>
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
              {organizedComments.map((comment) => (
                <div 
                  key={comment.id} 
                  id={`comment-${comment.id}`}
                  className={`space-y-3 transition-all duration-500 ${
                    highlightedCommentId === comment.id 
                      ? 'bg-yellow-100 border border-yellow-300 rounded-lg p-3 -m-3' 
                      : ''
                  }`}
                >
                  {/* Main Comment */}
                  <div className="flex space-x-3">
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
                      
                      {/* Comment Actions */}
                      <div className="flex items-center space-x-4 mt-2">
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                        >
                          <Reply className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                        
                        {comment.replies && comment.replies.length > 0 && (
                          <button
                            onClick={() => toggleExpanded(comment.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                          >
                            {expandedComments.has(comment.id) ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                <span>Hide {comment.replies.length} replies</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                <span>View {comment.replies.length} replies</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      
                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <form onSubmit={handleSubmitReply} className="mt-3">
                          <div className="flex space-x-2">
                            <Avatar className="w-6 h-6 flex-shrink-0">
                              <AvatarFallback className="text-xs">U</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex space-x-2">
                              <Input
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={`Reply to ${comment.profiles?.username || 'this comment'}...`}
                                className="text-sm"
                                autoFocus
                              />
                              <Button type="submit" size="sm" disabled={!replyContent.trim()}>
                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                  
                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && expandedComments.has(comment.id) && (
                    <div className="ml-11 space-y-3 border-l-2 border-gray-100 pl-4">
                      {comment.replies.map((reply) => (
                        <div 
                          key={reply.id} 
                          id={`comment-${reply.id}`}
                          className={`flex space-x-3 transition-all duration-500 ${
                            highlightedCommentId === reply.id 
                              ? 'bg-yellow-100 border border-yellow-300 rounded-lg p-2 -m-2' 
                              : ''
                          }`}
                        >
                          <Avatar className="w-6 h-6 flex-shrink-0">
                            <AvatarImage src={reply.profiles?.avatar_url || ''} />
                            <AvatarFallback className="text-xs">
                              {reply.profiles?.username?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-xs">
                                {reply.profiles?.username || 'Unknown User'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-xs mt-1 text-gray-700">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
            <div className="flex-1 overflow-y-auto min-h-0">
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
              <div className="p-4 space-y-4 bg-white">
                {organizedComments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No comments yet</p>
                    <p className="text-gray-400 text-xs">Be the first to comment!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {organizedComments.map((comment) => (
                      <div key={comment.id} className="space-y-3">
                        {/* Main Comment */}
                        <div className="flex space-x-3 bg-gray-50 p-3 rounded-lg">
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
                            
                            {/* Mobile Comment Actions */}
                            <div className="flex items-center space-x-4 mt-2">
                              <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                              >
                                <Reply className="w-3 h-3" />
                                <span>Reply</span>
                              </button>
                              
                              {comment.replies && comment.replies.length > 0 && (
                                <button
                                  onClick={() => toggleExpanded(comment.id)}
                                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                                >
                                  {expandedComments.has(comment.id) ? (
                                    <>
                                      <ChevronUp className="w-3 h-3" />
                                      <span>Hide {comment.replies.length} replies</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3" />
                                      <span>View {comment.replies.length} replies</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                            
                            {/* Mobile Reply Input */}
                            {replyingTo === comment.id && (
                              <form onSubmit={handleSubmitReply} className="mt-3">
                                <div className="flex space-x-2">
                                  <Avatar className="w-6 h-6 flex-shrink-0">
                                    <AvatarFallback className="text-xs">U</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 flex space-x-2">
                                    <Input
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      placeholder={`Reply to ${comment.profiles?.username || 'this comment'}...`}
                                      className="text-sm"
                                      autoFocus
                                    />
                                    <Button type="submit" size="sm" disabled={!replyContent.trim()}>
                                      <Send className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </form>
                            )}
                          </div>
                        </div>
                        
                        {/* Mobile Replies */}
                        {comment.replies && comment.replies.length > 0 && expandedComments.has(comment.id) && (
                          <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex space-x-3 bg-gray-100 p-2 rounded-lg">
                                <Avatar className="w-6 h-6 flex-shrink-0">
                                  <AvatarImage src={reply.profiles?.avatar_url || ''} />
                                  <AvatarFallback className="text-xs">
                                    {reply.profiles?.username?.[0]?.toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-xs">
                                      {reply.profiles?.username || 'Unknown User'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                    </span>
                                  </div>
                                  <p className="text-xs mt-1 text-gray-700">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
