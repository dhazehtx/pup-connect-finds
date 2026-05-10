
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedHeart from '@/components/ui/animated-heart';
import LikesModal from '@/components/post/LikesModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: number;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  likedBy?: Array<{
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
    isFollowing?: boolean;
  }>;
  replies?: Comment[];
  parent_comment_id?: number;
}

interface CommentsSectionProps {
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  onProfileClick: (userId: string) => void;
}

const CommentsSection = ({ comments, setComments, onProfileClick }: CommentsSectionProps) => {
  const [showAllComments, setShowAllComments] = useState(false);
  const [showCommentLikesModal, setShowCommentLikesModal] = useState(false);
  const [selectedCommentLikes, setSelectedCommentLikes] = useState<Array<{
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
    isFollowing?: boolean;
  }>>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const visibleComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

  const handleCommentLike = (commentId: number) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like comments",
        variant: "destructive",
      });
      return;
    }

    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

  const handleShowCommentLikes = (commentId: number) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.likedBy && comment.likes > 0) {
      setSelectedCommentLikes(comment.likedBy);
      setShowCommentLikesModal(true);
    }
  };

  const handleReply = (commentId: number) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to reply to comments",
        variant: "destructive",
      });
      return;
    }
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyText('');
  };

  const handleSubmitReply = (parentCommentId: number) => {
    if (!user || !replyText.trim()) return;

    const newReply: Comment = {
      id: Date.now() + Math.random(), // Temporary ID
      user: {
        id: user.id,
        name: user.user_metadata?.full_name || 'You',
        username: user.user_metadata?.username || 'you',
        avatar: user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
      },
      text: replyText.trim(),
      timestamp: 'now',
      likes: 0,
      isLiked: false,
      parent_comment_id: parentCommentId,
    };

    setComments(prev => prev.map(comment => 
      comment.id === parentCommentId 
        ? {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          }
        : comment
    ));

    setReplyText('');
    setReplyingTo(null);
    
    toast({
      title: "Reply posted",
      description: "Your reply has been added to the comment",
    });
  };

  return (
    <div>
      {/* View all comments link */}
      {hasMoreComments && !showAllComments && (
        <button
          onClick={() => setShowAllComments(true)}
          className="text-gray-600 text-sm mb-3 hover:text-gray-800"
        >
          View all {comments.length} comments
        </button>
      )}

      {/* Comments list */}
      <div className="space-y-3">
        {visibleComments.map((comment) => (
          <div key={comment.id} className="space-y-2">
            {/* Main comment */}
            <div className="flex items-start gap-2">
              <Avatar 
                className="h-6 w-6 cursor-pointer" 
                onClick={() => onProfileClick(comment.user.id)}
              >
                <AvatarImage src={comment.user.avatar} />
                <AvatarFallback className="text-xs">
                  {comment.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span 
                      className="font-medium text-sm mr-2 cursor-pointer hover:underline"
                      onClick={() => onProfileClick(comment.user.id)}
                    >
                      {comment.user.username}
                    </span>
                    <span className="text-sm break-words">{comment.text}</span>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <AnimatedHeart 
                      isLiked={comment.isLiked}
                      onToggle={() => handleCommentLike(comment.id)}
                      size={12}
                      className="text-gray-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-gray-500 text-xs">{comment.timestamp}</p>
                  {comment.likes > 0 && (
                    <p 
                      className="text-gray-500 text-xs cursor-pointer hover:text-gray-700"
                      onClick={() => handleShowCommentLikes(comment.id)}
                    >
                      {comment.likes} likes
                    </p>
                  )}
                  <button
                    onClick={() => handleReply(comment.id)}
                    className="text-gray-500 text-xs hover:text-gray-700 font-medium"
                  >
                    Reply
                  </button>
                </div>

                {/* Reply input */}
                {replyingTo === comment.id && (
                  <div className="mt-2 flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user?.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user?.id}`} />
                      <AvatarFallback className="text-xs">
                        {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder={`Reply to ${comment.user.username}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 text-xs border-0 border-b border-gray-200 focus:border-blue-500 focus:outline-none bg-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && replyText.trim()) {
                            handleSubmitReply(comment.id);
                          }
                        }}
                      />
                      {replyText.trim() && (
                        <button
                          onClick={() => handleSubmitReply(comment.id)}
                          className="text-blue-500 text-xs font-medium hover:text-blue-600"
                        >
                          Post
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2 ml-4 space-y-2 border-l-2 border-gray-100 pl-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <Avatar 
                          className="h-5 w-5 cursor-pointer" 
                          onClick={() => onProfileClick(reply.user.id)}
                        >
                          <AvatarImage src={reply.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {reply.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <span 
                                className="font-medium text-xs mr-2 cursor-pointer hover:underline"
                                onClick={() => onProfileClick(reply.user.id)}
                              >
                                {reply.user.username}
                              </span>
                              <span className="text-xs break-words">{reply.text}</span>
                            </div>
                            <div className="ml-2 flex-shrink-0">
                              <AnimatedHeart 
                                isLiked={reply.isLiked}
                                onToggle={() => handleCommentLike(reply.id)}
                                size={10}
                                className="text-gray-500"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-gray-400 text-xs">{reply.timestamp}</p>
                            {reply.likes > 0 && (
                              <p 
                                className="text-gray-400 text-xs cursor-pointer hover:text-gray-600"
                                onClick={() => handleShowCommentLikes(reply.id)}
                              >
                                {reply.likes} likes
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show less comments */}
      {showAllComments && hasMoreComments && (
        <button
          onClick={() => setShowAllComments(false)}
          className="text-gray-600 text-sm mt-3 hover:text-gray-800"
        >
          Show less
        </button>
      )}

      {/* Comment Likes Modal */}
      <LikesModal
        isOpen={showCommentLikesModal}
        onClose={() => setShowCommentLikesModal(false)}
        likes={selectedCommentLikes}
        onProfileClick={onProfileClick}
      />
    </div>
  );
};

export default CommentsSection;
