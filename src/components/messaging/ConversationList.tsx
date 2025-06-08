
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  other_user?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  listing?: {
    dog_name: string;
    breed: string;
    image_url: string | null;
  };
  last_message_at: string | null;
  unread_count?: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  loading?: boolean;
}

const ConversationList = ({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation, 
  loading = false 
}: ConversationListProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm">Start browsing listings to connect with sellers!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const isSelected = selectedConversationId === conversation.id;
        const displayName = conversation.other_user?.full_name || 
                           conversation.other_user?.username || 
                           'Anonymous User';
        const timeAgo = conversation.last_message_at ? 
                       formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true }) : 
                       '';

        return (
          <Card 
            key={conversation.id}
            className={`cursor-pointer transition-colors ${
              isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conversation.other_user?.avatar_url || ''} />
                  <AvatarFallback>
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">
                      {displayName}
                    </h4>
                    {conversation.unread_count && conversation.unread_count > 0 && (
                      <Badge variant="default" className="ml-2">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>

                  {conversation.listing && (
                    <p className="text-xs text-gray-600 truncate">
                      About: {conversation.listing.dog_name} ({conversation.listing.breed})
                    </p>
                  )}

                  {timeAgo && (
                    <p className="text-xs text-gray-500 mt-1">
                      {timeAgo}
                    </p>
                  )}
                </div>

                {conversation.listing?.image_url && (
                  <img
                    src={conversation.listing.image_url}
                    alt={conversation.listing.dog_name}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ConversationList;
