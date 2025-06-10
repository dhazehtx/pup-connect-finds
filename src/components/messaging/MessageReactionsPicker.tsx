
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MessageReactionsPickerProps {
  messageId: string;
  onReactionAdd: (messageId: string, emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

const MessageReactionsPicker = ({
  messageId,
  onReactionAdd,
  isOpen,
  onClose,
  position
}: MessageReactionsPickerProps) => {
  const quickReactions = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎'];

  if (!isOpen) return null;

  const style = position ? {
    position: 'fixed' as const,
    top: position.y - 60,
    left: position.x,
    zIndex: 50
  } : {};

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <Card 
        className="absolute shadow-lg border"
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-2">
          <div className="flex gap-1">
            {quickReactions.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted text-lg"
                onClick={() => {
                  onReactionAdd(messageId, emoji);
                  onClose();
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageReactionsPicker;
