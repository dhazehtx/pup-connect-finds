
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const commonEmojis = ['😀', '😂', '😍', '🥰', '😊', '😢', '😮', '😡', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '🙏'];

const EmojiPicker = ({ onEmojiSelect, onClose }: EmojiPickerProps) => {
  return (
    <Card className="p-3 bg-background border shadow-lg">
      <div className="grid grid-cols-8 gap-1">
        {commonEmojis.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-lg hover:bg-muted"
            onClick={() => onEmojiSelect(emoji)}
          >
            {emoji}
          </Button>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="w-full text-xs"
        >
          Close
        </Button>
      </div>
    </Card>
  );
};

export default EmojiPicker;
