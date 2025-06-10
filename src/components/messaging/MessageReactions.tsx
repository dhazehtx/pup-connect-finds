
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, ThumbsUp, Laugh, Angry, Frown, Plus } from 'lucide-react';

interface MessageReactionsProps {
  messageId: string;
  reactions?: { [emoji: string]: string[] }; // emoji -> user IDs
  onAddReaction: (messageId: string, emoji: string) => void;
  currentUserId: string;
}

const MessageReactions = ({ 
  messageId, 
  reactions = {}, 
  onAddReaction, 
  currentUserId 
}: MessageReactionsProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const reactionEmojis = [
    { emoji: '❤️', icon: Heart, label: 'Love' },
    { emoji: '👍', icon: ThumbsUp, label: 'Like' },
    { emoji: '😂', icon: Laugh, label: 'Laugh' },
    { emoji: '😢', icon: Frown, label: 'Sad' },
    { emoji: '😠', icon: Angry, label: 'Angry' },
  ];

  const handleReaction = (emoji: string) => {
    onAddReaction(messageId, emoji);
    setShowPicker(false);
  };

  const hasReactions = Object.keys(reactions).length > 0;

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Display existing reactions */}
      {hasReactions && (
        <div className="flex gap-1">
          {Object.entries(reactions).map(([emoji, userIds]) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs ${
                userIds.includes(currentUserId) ? 'bg-blue-100 text-blue-800' : ''
              }`}
              onClick={() => handleReaction(emoji)}
            >
              {emoji} {userIds.length}
            </Button>
          ))}
        </div>
      )}

      {/* Add reaction button */}
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Plus size={12} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="grid grid-cols-5 gap-2">
            {reactionEmojis.map(({ emoji, icon: Icon, label }) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(emoji)}
                className="h-8 w-8 p-0"
                title={label}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;
