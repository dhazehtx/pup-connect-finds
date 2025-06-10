
import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ConversationSearchProps {
  conversations: any[];
  onFilteredConversations: (filtered: any[]) => void;
  placeholder?: string;
}

const ConversationSearch = ({ 
  conversations, 
  onFilteredConversations, 
  placeholder = "Search conversations..." 
}: ConversationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }

    return conversations.filter(conversation => {
      const userName = conversation.other_user?.full_name || 
                     conversation.other_user?.username || '';
      const dogName = conversation.listing?.dog_name || '';
      const breed = conversation.listing?.breed || '';
      
      const searchTerms = searchQuery.toLowerCase().split(' ');
      const searchableText = `${userName} ${dogName} ${breed}`.toLowerCase();
      
      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [conversations, searchQuery]);

  React.useEffect(() => {
    onFilteredConversations(filteredConversations);
  }, [filteredConversations, onFilteredConversations]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X size={14} />
          </Button>
        )}
      </div>
      {searchQuery && (
        <p className="text-xs text-muted-foreground mt-2">
          Found {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default ConversationSearch;
