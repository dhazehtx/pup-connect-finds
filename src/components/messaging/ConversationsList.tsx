
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ExtendedConversation } from '@/types/messaging';
import { User } from 'lucide-react';

interface ConversationsListProps {
  conversations: ExtendedConversation[];
  selectedConversationId?: string | null;
  onSelectConversation: (conversation: ExtendedConversation) => void;
}

const ConversationsList = ({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation 
}: ConversationsListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <User className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
        <p className="text-muted-foreground">
          Start browsing listings to connect with breeders
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
            selectedConversationId === conversation.id ? 'bg-muted' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={conversation.other_user?.avatar_url} />
              <AvatarFallback>
                {conversation.other_user?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold truncate">
                  {conversation.other_user?.full_name || conversation.other_user?.username || 'Unknown User'}
                </h4>
                {conversation.last_message && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              {conversation.listing && (
                <p className="text-sm text-muted-foreground mb-1">
                  About: {conversation.listing.dog_name} {conversation.listing.breed && `(${conversation.listing.breed})`}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.last_message?.content || 'No messages yet'}
                </p>
                {conversation.unread_count > 0 && (
                  <Badge variant="default" className="ml-2">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ConversationsList;
