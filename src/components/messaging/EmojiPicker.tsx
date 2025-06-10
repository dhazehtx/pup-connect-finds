
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker = ({ onEmojiSelect, onClose }: EmojiPickerProps) => {
  const emojis = [
    '😀', '😂', '😍', '🥰', '😘', '😊', '😉', '😎',
    '🤔', '😅', '😇', '🙂', '😌', '😋', '😛', '🤨',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👏', '🙌', '👐', '🤝', '🙏', '✋', '🤚', '👋',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘',
    '🔥', '⭐', '🌟', '✨', '⚡', '💫', '💥', '💢',
    '💯', '💤', '💨', '💦', '💧', '💩', '🎉', '🎊'
  ];

  return (
    <Card className="w-64 shadow-lg">
      <CardContent className="p-3">
        <div className="grid grid-cols-8 gap-1">
          {emojis.map((emoji, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted"
              onClick={() => onEmojiSelect(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmojiPicker;
