
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile, ThumbsUp, Heart, Laugh, Angry, Sad } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageReactionsProps {
  messageId: string;
  reactions?: Record<string, string[]>; // emoji -> user_ids
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  currentUserId: string;
}

const DEFAULT_EMOJIS = [
  { emoji: '👍', icon: ThumbsUp, label: 'Like' },
  { emoji: '❤️', icon: Heart, label: 'Love' },
  { emoji: '😂', icon: Laugh, label: 'Laugh' },
  { emoji: '😮', icon: Smile, label: 'Wow' },
  { emoji: '😢', icon: Sad, label: 'Sad' },
  { emoji: '😡', icon: Angry, label: 'Angry' },
];

const MessageReactions = ({ 
  messageId, 
  reactions = {}, 
  onAddReaction, 
  onRemoveReaction, 
  currentUserId 
}: MessageReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleReactionClick = (emoji: string) => {
    const userReactions = reactions[emoji] || [];
    const hasReacted = userReactions.includes(currentUserId);

    if (hasReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
    setIsOpen(false);
  };

  const getReactionCount = (emoji: string) => {
    return reactions[emoji]?.length || 0;
  };

  const hasUserReacted = (emoji: string) => {
    return reactions[emoji]?.includes(currentUserId) || false;
  };

  // Get reactions that have been used
  const usedReactions = Object.entries(reactions).filter(([, userIds]) => userIds.length > 0);

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Display existing reactions */}
      {usedReactions.map(([emoji, userIds]) => (
        <Button
          key={emoji}
          variant={hasUserReacted(emoji) ? "default" : "outline"}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => handleReactionClick(emoji)}
        >
          <span className="mr-1">{emoji}</span>
          {userIds.length > 1 && <span>{userIds.length}</span>}
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Smile size={14} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-3 gap-1">
            {DEFAULT_EMOJIS.map(({ emoji, label }) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleReactionClick(emoji)}
                title={label}
              >
                <span className="text-lg">{emoji}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;
