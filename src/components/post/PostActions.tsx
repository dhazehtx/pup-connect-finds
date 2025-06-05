
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send } from 'lucide-react';
import AnimatedHeart from '@/components/ui/animated-heart';

interface PostActionsProps {
  isLiked: boolean;
  allowComments: boolean;
  onLikeToggle: () => void;
  onCommentClick: () => void;
  onShareClick: () => void;
}

const PostActions = ({
  isLiked,
  allowComments,
  onLikeToggle,
  onCommentClick,
  onShareClick
}: PostActionsProps) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-4">
        <AnimatedHeart 
          isLiked={isLiked}
          onToggle={onLikeToggle}
          size={24}
        />
        {allowComments && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCommentClick}
            className="p-0 h-auto hover:bg-transparent"
          >
            <MessageCircle size={24} className="text-gray-700 hover:text-gray-900" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onShareClick}
          className="p-0 h-auto hover:bg-transparent"
        >
          <Send size={24} className="text-gray-700 hover:text-gray-900" />
        </Button>
      </div>
    </div>
  );
};

export default PostActions;
