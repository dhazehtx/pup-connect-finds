
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare } from 'lucide-react';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { formatDistanceToNow } from 'date-fns';

interface MessageSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  onMessageSelect?: (messageId: string) => void;
}

const MessageSearchDialog = ({ 
  isOpen, 
  onClose, 
  conversationId, 
  onMessageSelect 
}: MessageSearchDialogProps) => {
  const [query, setQuery] = useState('');
  const { searchResults, isSearching, searchMessages } = useMessageSearch();

  const handleSearch = async () => {
    if (query.trim()) {
      await searchMessages(query, conversationId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for messages..."
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search size={16} />
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {isSearching && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Searching...</p>
              </div>
            )}

            {!isSearching && searchResults.length === 0 && query && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages found for "{query}"</p>
              </div>
            )}

            {searchResults.map((message) => (
              <div
                key={message.id}
                onClick={() => onMessageSelect?.(message.id)}
                className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <p className="text-sm break-words mb-2">{message.content}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageSearchDialog;
