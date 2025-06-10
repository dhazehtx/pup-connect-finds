
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users } from 'lucide-react';

interface ThreadIndicatorProps {
  threadCount: number;
  onViewThread: () => void;
  compact?: boolean;
}

const ThreadIndicator = ({ threadCount, onViewThread, compact = false }: ThreadIndicatorProps) => {
  if (threadCount === 0) return null;

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onViewThread}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
      >
        <MessageCircle className="w-3 h-3 mr-1" />
        {threadCount}
      </Button>
    );
  }

  return (
    <div className="mt-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onViewThread}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-muted/50"
      >
        <MessageCircle className="w-3 h-3 mr-1" />
        {threadCount === 1 ? '1 reply' : `${threadCount} replies`}
        <Users className="w-3 h-3 ml-1" />
      </Button>
    </div>
  );
};

export default ThreadIndicator;
