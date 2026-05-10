import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useCommentReplies } from '@/hooks/useCommentReplies';
import CommentReplyItem from './CommentReplyItem';
import CommentReplyInput from './CommentReplyInput';

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

interface CommentWithRepliesProps {
  comment: Comment;
  onProfileClick?: (userId: string) => void;
}

interface CommentReply {
  id: string;
  comment_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const CommentWithReplies: React.FC<CommentWithRepliesProps> = ({
  comment,
  onProfileClick
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  
  const { 
    replies, 
    isLoading: repliesLoading, 
    addReply, 
    isCreatingReply 
  } = useCommentReplies(showReplies ? comment.id : null);

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick(comment.user_id);
    }
  };

  const handleReplyClick = () => {
    if (!showReplies) {
      setShowReplies(true);
    }
    setShowReplyInput(!showReplyInput);
  };

  const handleSubmitReply = (content: string) => {
    addReply(comment.id, content);
    setShowReplyInput(false);
  };

  const handleToggleReplies = () => {
    setShowReplies(!showReplies);
    if (!showReplies) {
      setShowReplyInput(false);
    }
  };

  const displayName = comment.profiles?.full_name || comment.profiles?.username || 'Unknown User';
  const username = comment.profiles?.username || 'unknown';
  const avatar = comment.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${comment.user_id}`;
  const replyCount = replies.length;

  return (
    <div className="space-y-2">
      {/* Main Comment */}
      <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
        <Avatar 
          className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={handleProfileClick}
        >
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-xs">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="font-semibold text-sm cursor-pointer hover:underline"
              onClick={handleProfileClick}
            >
              {username}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 break-words mb-2">
            {comment.content}
          </p>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 text-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReplyClick}
              className="text-gray-500 hover:text-gray-700 p-0 h-auto font-normal"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Reply
            </Button>

            {replyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleReplies}
                className="text-gray-500 hover:text-gray-700 p-0 h-auto font-normal"
              >
                {showReplies ? (
                  <ChevronUp className="w-4 h-4 mr-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 mr-1" />
                )}
                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Input */}
      {showReplyInput && (
        <CommentReplyInput
          commentId={comment.id}
          onSubmitReply={handleSubmitReply}
          onCancel={() => setShowReplyInput(false)}
          isSubmitting={isCreatingReply}
        />
      )}

      {/* Replies */}
      {showReplies && (
        <div className="space-y-2">
          {repliesLoading ? (
            <div className="pl-8 py-2">
              <div className="text-sm text-gray-500">Loading replies...</div>
            </div>
          ) : replies.length > 0 ? (
            (replies as CommentReply[]).map((reply) => (
              <CommentReplyItem
                key={reply.id}
                reply={reply}
                onProfileClick={onProfileClick}
              />
            ))
          ) : (
            <div className="pl-8 py-2">
              <div className="text-sm text-gray-500">No replies yet</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentWithReplies;