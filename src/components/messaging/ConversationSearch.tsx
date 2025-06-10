
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExtendedConversation } from '@/types/messaging';

interface ConversationSearchProps {
  conversations: ExtendedConversation[];
  onFilteredConversations: (filtered: ExtendedConversation[]) => void;
}

const ConversationSearch = ({ conversations, onFilteredConversations }: ConversationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!searchQuery.trim()) {
      onFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(conversation => {
      const userName = conversation.other_user?.full_name || conversation.other_user?.username || '';
      const dogName = conversation.listing?.dog_name || '';
      const breed = conversation.listing?.breed || '';
      
      return (
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dogName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        breed.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    onFilteredConversations(filtered);
  }, [searchQuery, conversations, onFilteredConversations]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConversationSearch;
