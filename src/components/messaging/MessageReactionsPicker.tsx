
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

interface MessageReactionsPickerProps {
  messageId: string;
  onReactionAdd: (messageId: string, emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

const EMOJI_REACTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💯', label: 'Perfect' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🙏', label: 'Thanks' }
];

const MessageReactionsPicker = ({
  messageId,
  onReactionAdd,
  isOpen,
  onClose,
  position
}: MessageReactionsPickerProps) => {
  console.log('😊 MessageReactionsPicker - Rendering:', {
    messageId,
    isOpen,
    position,
    emojiCount: EMOJI_REACTIONS.length
  });

  if (!isOpen) return null;

  const handleReactionClick = (emoji: string) => {
    console.log('😊 MessageReactionsPicker - Emoji clicked:', { messageId, emoji });
    onReactionAdd(messageId, emoji);
    onClose();
  };

  const style = position ? {
    position: 'fixed' as const,
    top: position.y - 60,
    left: position.x - 150,
    zIndex: 1000
  } : {};

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Picker */}
      <Card className="shadow-lg border" style={style}>
        <CardContent className="p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">Add Reaction</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-4 w-4 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="grid grid-cols-6 gap-1 max-w-xs">
            {EMOJI_REACTIONS.map(({ emoji, label }) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleReactionClick(emoji)}
                className="h-8 w-8 p-0 hover:bg-muted/80 text-lg"
                title={label}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MessageReactionsPicker;
