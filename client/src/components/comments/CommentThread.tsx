import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CommentInput from './CommentInput';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  mentions?: string[];
  likes_count: number;
  replies_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    username: string;
    avatar_url?: string;
    verified?: boolean;
  };
  replies?: Comment[];
}

interface CommentThreadProps {
  comment: Comment;
  level?: number;
  onReply: (commentId: string, content: string, mentions: string[]) => void;
  onLike: (commentId: string) => void;
  onLoadReplies?: (commentId: string) => Promise<Comment[]>;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  level = 0,
  onReply,
  onLike,
  onLoadReplies
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();

  const maxLevel = 3; // Maximum nesting level
  const canReply = level < maxLevel;

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(comment.id);
  };

  const handleReply = async (content: string, mentions: string[]) => {
    await onReply(comment.id, content, mentions);
    setShowReplyInput(false);
    
    // Refresh replies if they're being shown
    if (showReplies && onLoadReplies) {
      const updatedReplies = await onLoadReplies(comment.id);
      setReplies(updatedReplies);
    }
  };

  const handleShowReplies = async () => {
    if (!showReplies && onLoadReplies) {
      setLoadingReplies(true);
      try {
        const loadedReplies = await onLoadReplies(comment.id);
        setReplies(loadedReplies);
      } catch (error) {
        console.error('Error loading replies:', error);
      } finally {
        setLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const parseContentWithMentions = (content: string, mentions: string[] = []) => {
    if (!mentions.length) return content;

    let parsedContent = content;
    mentions.forEach(username => {
      const mentionRegex = new RegExp(`@${username}`, 'gi');
      parsedContent = parsedContent.replace(
        mentionRegex,
        `<span class="text-blue-600 font-medium cursor-pointer hover:underline">@${username}</span>`
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: parsedContent }} />;
  };

  const getIndentStyle = () => {
    if (level === 0) return {};
    return {
      marginLeft: `${Math.min(level * 24, 72)}px`,
      borderLeft: level > 0 ? '2px solid #e5e7eb' : 'none',
      paddingLeft: level > 0 ? '12px' : '0',
    };
  };

  return (
    <div style={getIndentStyle()} className="space-y-3">
      {/* Main Comment */}
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.profiles?.avatar_url} />
          <AvatarFallback className="text-xs">
            {comment.profiles?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {comment.profiles?.full_name || 'Anonymous'}
              </span>
              <span className="text-muted-foreground text-xs">
                @{comment.profiles?.username || 'user'}
              </span>
              {comment.profiles?.verified && (
                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            
            <div className="text-sm">
              {parseContentWithMentions(comment.content, comment.mentions)}
            </div>
          </div>
          
          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-2 text-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`p-0 h-auto ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`w-3 h-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {comment.likes_count}
            </Button>
            
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="p-0 h-auto text-muted-foreground"
              >
                Reply
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto text-muted-foreground"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-3">
              <CommentInput
                placeholder={`Reply to ${comment.profiles?.username || 'user'}...`}
                onSubmit={handleReply}
                onCancel={() => setShowReplyInput(false)}
                buttonText="Reply"
                autoFocus
              />
            </div>
          )}
          
          {/* Show Replies Button */}
          {comment.replies_count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowReplies}
              disabled={loadingReplies}
              className="mt-2 p-0 h-auto text-muted-foreground text-xs"
            >
              {loadingReplies ? (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Loading replies...
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  {showReplies ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  {showReplies ? 'Hide' : 'View'} {comment.replies_count} {comment.replies_count === 1 ? 'reply' : 'replies'}
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Nested Replies */}
      {showReplies && replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              level={level + 1}
              onReply={onReply}
              onLike={onLike}
              onLoadReplies={onLoadReplies}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;