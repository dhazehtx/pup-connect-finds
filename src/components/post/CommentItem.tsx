
import React, { useState } from 'react';
import { Heart, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommentLikes } from '@/hooks/useCommentLikes';
import { getRelativeTime } from '@/utils/timeUtils';

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    profiles?: {
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    } | null;
  };
  onReply: (commentId: string) => void;
  onProfileClick: (userId: string) => void;
  isReply?: boolean;
  replies?: any[];
  showReplies?: boolean;
}

const CommentItem = ({
  comment,
  onReply,
  onProfileClick,
  isReply = false,
  replies = [],
  showReplies = false
}: CommentItemProps) => {
  const { likes, isLiked, loading, toggleLike, likesCount } = useCommentLikes(comment.id);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleReplyClick = () => {
    setShowReplyInput(true);
    onReply(comment.id);
  };

  const handleUsernameClick = () => {
    // Extract user ID from comment (you might need to adjust this based on your data structure)
    const userId = comment.profiles?.username || 'unknown';
    onProfileClick(userId);
  };

  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="flex items-start gap-3 py-2">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.profiles?.avatar_url || ''} />
          <AvatarFallback className="text-xs">
            {comment.profiles?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={handleUsernameClick}
              className="font-medium text-sm hover:underline"
            >
              {comment.profiles?.username || 'Unknown User'}
            </button>
            <span className="text-xs text-gray-500">
              {getRelativeTime(comment.created_at)}
            </span>
          </div>

          <p className="text-sm text-gray-800 mb-2">{comment.content}</p>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLike}
              disabled={loading}
              className="h-auto p-0 hover:bg-transparent"
            >
              <Heart
                size={14}
                className={`mr-1 ${
                  isLiked ? 'text-red-500 fill-current' : 'text-gray-500'
                }`}
              />
              {likesCount > 0 && (
                <span className="text-xs text-gray-600">{likesCount}</span>
              )}
            </Button>

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReplyClick}
                className="h-auto p-0 hover:bg-transparent text-xs text-gray-500"
              >
                <Reply size={14} className="mr-1" />
                Reply
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Show replies if they exist and showReplies is true */}
      {showReplies && replies.length > 0 && (
        <div className="mt-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onProfileClick={onProfileClick}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
