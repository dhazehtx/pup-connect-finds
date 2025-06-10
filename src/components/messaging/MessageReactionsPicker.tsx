
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';

interface MessageReactionsPickerProps {
  messageId: string;
  onReact: (messageId: string, reaction: string) => void;
  existingReactions?: { emoji: string; count: number; userReacted: boolean }[];
}

const EMOJI_REACTIONS = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡'];

const MessageReactionsPicker = ({ 
  messageId, 
  onReact, 
  existingReactions = [] 
}: MessageReactionsPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReaction = (emoji: string) => {
    onReact(messageId, emoji);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-1">
      {existingReactions.map((reaction, index) => (
        <Button
          key={index}
          variant={reaction.userReacted ? "default" : "outline"}
          size="sm"
          onClick={() => handleReaction(reaction.emoji)}
          className="h-6 px-2 text-xs"
        >
          {reaction.emoji} {reaction.count}
        </Button>
      ))}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Smile size={14} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="grid grid-cols-4 gap-2">
            {EMOJI_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(emoji)}
                className="h-8 w-8 p-0 text-lg hover:bg-muted"
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

export default MessageReactionsPicker;
