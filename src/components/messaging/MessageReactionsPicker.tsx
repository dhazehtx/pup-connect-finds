
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Smile, Heart, ThumbsUp, ThumbsDown, Laugh, Angry } from 'lucide-react';

interface MessageReactionsPickerProps {
  messageId: string;
  onReactionAdd: (messageId: string, emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

const commonEmojis = [
  { emoji: '👍', icon: ThumbsUp, label: 'thumbs up' },
  { emoji: '❤️', icon: Heart, label: 'heart' },
  { emoji: '😂', icon: Laugh, label: 'laugh' },
  { emoji: '😮', icon: Smile, label: 'wow' },
  { emoji: '😢', label: 'sad' },
  { emoji: '😡', icon: Angry, label: 'angry' },
  { emoji: '👎', icon: ThumbsDown, label: 'thumbs down' },
  { emoji: '🎉', label: 'party' },
  { emoji: '🔥', label: 'fire' },
  { emoji: '💯', label: 'hundred' },
];

const MessageReactionsPicker = ({
  messageId,
  onReactionAdd,
  isOpen,
  onClose,
  position
}: MessageReactionsPickerProps) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReactionClick = (emoji: string) => {
    onReactionAdd(messageId, emoji);
    onClose();
  };

  return (
    <div
      className="fixed z-50"
      style={{
        left: position?.x || 0,
        top: position?.y || 0,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <Card ref={pickerRef} className="shadow-lg border">
        <CardContent className="p-2">
          <div className="flex gap-1">
            {commonEmojis.map((reaction) => (
              <Button
                key={reaction.emoji}
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-muted text-lg"
                onClick={() => handleReactionClick(reaction.emoji)}
                title={reaction.label}
              >
                {reaction.icon ? (
                  <reaction.icon className="w-4 h-4" />
                ) : (
                  reaction.emoji
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageReactionsPicker;
