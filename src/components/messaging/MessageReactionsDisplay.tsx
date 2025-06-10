
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MessageReaction {
  emoji: string;
  users: Array<{
    id: string;
    name: string;
  }>;
  count: number;
}

interface MessageReactionsDisplayProps {
  reactions: MessageReaction[];
  currentUserId: string;
  onReactionToggle: (emoji: string) => void;
  className?: string;
}

const MessageReactionsDisplay = ({
  reactions,
  currentUserId,
  onReactionToggle,
  className
}: MessageReactionsDisplayProps) => {
  if (!reactions || reactions.length === 0) return null;

  const getTooltipText = (reaction: MessageReaction) => {
    if (reaction.count === 1) {
      return reaction.users[0].name;
    } else if (reaction.count === 2) {
      return `${reaction.users[0].name} and ${reaction.users[1].name}`;
    } else {
      return `${reaction.users[0].name} and ${reaction.count - 1} others`;
    }
  };

  const hasUserReacted = (reaction: MessageReaction) => {
    return reaction.users.some(user => user.id === currentUserId);
  };

  return (
    <div className={cn('flex flex-wrap gap-1 mt-1', className)}>
      <TooltipProvider>
        {reactions.map((reaction) => (
          <Tooltip key={reaction.emoji}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-6 px-2 py-1 text-xs rounded-full',
                  hasUserReacted(reaction)
                    ? 'bg-primary/20 border border-primary/30'
                    : 'bg-muted hover:bg-muted/80'
                )}
                onClick={() => onReactionToggle(reaction.emoji)}
              >
                <span className="mr-1">{reaction.emoji}</span>
                <span className="text-xs">{reaction.count}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{getTooltipText(reaction)}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};

export default MessageReactionsDisplay;
